import HTTP_STATUS from 'http-status-codes';
import { resetPasswordTemplate } from '~services/emails/template/reset-password/reset-password-template';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { Request, Response } from 'express';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { BadRequesetError } from '~global/helpers/error-handler';
import { authService } from '~services/db/auth.service';
import { changePasswordSchema } from '~user/schemes/info.scheme';
import { IResetPasswordParams } from '~user/interfaces/user.interface';
import ip from 'ip';
import moment from 'moment';
import { emailQueue } from '~services/queues/email.queue';

export class Update {
  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) throw new BadRequesetError('New and confirm password is not match.');
    const authUser: IAuthDocument = await authService.getAuthUserByEmail(`${req.currentUser!.email}`);

    const isCorrectPassword: boolean = await authUser.comparePassword(currentPassword);
    if (!isCorrectPassword) throw new BadRequesetError('Invalid credentials.');
    const hashedPassword: string = await authUser.hashPassword(newPassword);
    // No need to use await
    authService.findAndUpdatePasswordByEmail(`${req.currentUser!.email}`, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      ipaddress: ip.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('changePassword', { subject: 'Change password confirmation', receiverEmail: req.currentUser!.email, template });
    res.status(HTTP_STATUS.OK).json({
      message: 'Update password successfully. You will be redirected to login page shortly.'
    });
  }
}
