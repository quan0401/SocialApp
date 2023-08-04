import Logger from 'bunyan';
import nodemailer from 'nodemailer';
import { config } from '~/config';
import { BadRequesetError } from '~global/helpers/error-handler';
import sendGridMail from '@sendgrid/mail';
import Mail from 'nodemailer/lib/mailer';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('MailTransport');

class MailTransport {
  public async sendMail(receiverEmail: string, subject: string, body: string): Promise<void> {
    // to do change to ===
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      await this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      await this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });

    const mailOptions: IMailOptions = {
      from: `Social app ${config.SENDER_EMAIL}`,
      to: receiverEmail,
      subject: subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('Development email sent successfully');
    } catch (error) {
      log.error(error);
      throw new BadRequesetError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `Social app ${config.SENDER_EMAIL}`,
      to: receiverEmail,
      subject: subject,
      html: body
    };
    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email sent successfully');
    } catch (error) {
      log.error(error);
      throw new BadRequesetError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
