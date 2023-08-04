import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '~auth/schemes/password';
import { Request, Response } from 'express';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { authService } from '~services/db/auth.service';
import { BadRequesetError } from '~global/helpers/error-handler';
import crypto from 'crypto';
import { config } from '~/config';
import { forgotPasswordTemplate } from '~services/emails/template/forgot-password/forgot-password-template';
import { emailQueue } from '~services/queues/email.queue';
import { IResetPasswordParams } from '~user/interfaces/user.interface';
import ip from 'ip';
import moment from 'moment';
import { resetPasswordTemplate } from '~services/emails/template/reset-password/reset-password-template';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response) {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequesetError('Invalid credentials');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(existingUser._id.toString(), randomCharacters, Date.now() * 60 * 60 * 1000);

    const resetLink: string = `${config.CLIENT_URI}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
    // to do: change to existingUser.email
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: 'esteban.schuppe46@ethereal.email',
      subject: 'Reset your password'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequesetError("Password doesn't match");
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequesetError('Reset token has expired');
    }
    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();
    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: ip.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // to do: change to existingUser.email
    emailQueue.addEmailJob('forgotPasswordEmail', {
      receiverEmail: 'esteban.schuppe46@ethereal.email',
      template,
      subject: 'Password reset confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}
