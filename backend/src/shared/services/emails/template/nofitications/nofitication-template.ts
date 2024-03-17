import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '~nofitication/interfaces/notification.interface';

class NofiticationTemplate {
  public nofiticationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, header, message, image_url } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/nofitication.ejs', 'utf8'), {
      username,
      header,
      message,
      image_url: image_url
        ? image_url
        : 'https://w7.pngwing.com/pngs/546/655/png-transparent-password-computer-icons-user-the-plain-style-miscellaneous-area-padlock.png'
    });
  }
}

export const nofiticationTemplate: NofiticationTemplate = new NofiticationTemplate();
