const nodemailer = require('nodemailer');
const fs = require('fs');
const util = require('util');

module.exports = class Email {
  constructor(email, url) {
    this.to = email;
    this.url = url;
    this.from = `Soporte WorKn <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'staging') {
      //Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
        tls: {
          //This is for allowing email sending when the host does not have a valid certificate
          rejectUnauthorized: false,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(options) {
    // 1) Parse HTML
    const html = await util.promisify(fs.readFile)(
      `${__dirname}/../mail_templates/${options.templateName}.html`,
      {
        encoding: 'utf-8',
      }
    );

    let ParsedHtml = html.replace('{%URL%}', this.url);

    if (options.organization) {
      ParsedHtml = ParsedHtml.replace('{%ORG_NAME%}', options.organization.name);
      ParsedHtml = ParsedHtml.replace(
        '{%ORG_PROFILE__PICTURE%}',
        options.organization.profilePicture
      );
    }

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: options.subject,
      html: ParsedHtml,
      text: options.plainText,
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error: ' + error.message);
      } else {
        console.log('Email sent to: ' + mailOptions.to);
      }
    });
  }

  async sendEmailValidation() {
    const plainText = `Para validar su email, por favor, haga clic en el siguiente enlace: ${this.url}\n
      Si no ha se ha registrado en la plataforma, por favor ignore este mensaje.`;

    await this.send({
      templateName: 'EmailValidation',
      subject: 'Validación de email',
      plainText,
    });
  }

  async sendPasswordReset() {
    const plainText = `Para restaurar su contraseña, por favor, haga clic en el siguiente enlace: ${this.url}\n
    Si no ha olvidado su contraseña, por favor ignore este mensaje.`;

    await this.send({
      templateName: 'PasswordReset',
      subject: 'Restauración de contraseña (válido por 10 minutos)',
      plainText,
    });
  }

  async sendMemberInvitation(organization) {
    const plainText = `Has sido invitado a ${organization.name} en WorKn, si deseas unirte accede a ${this.url},
     de lo contrario, por favor, ignore este correo.`;

    await this.send({
      templateName: 'MemberInvitation',
      subject: `Fuiste invitado a ${organization.name} en WorKn`,
      plainText,
      organization,
    });
  }
};
