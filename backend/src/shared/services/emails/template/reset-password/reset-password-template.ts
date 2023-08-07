import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '~user/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'), {
      username,
      email,
      ipaddress,
      date,
      image_url:
        'https://w7.pngwing.com/pngs/546/655/png-transparent-password-computer-icons-user-the-plain-style-miscellaneous-area-padlock.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
