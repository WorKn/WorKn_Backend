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
    // if (process.env.NODE_ENV === 'production') {
    if (true) {
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
  async send(templateName, subject, plainText) {
    // 1) Parse HTML
    const html = await util.promisify(fs.readFile)(
      `${__dirname}/../mail_templates/${templateName}.html`,
      {
        encoding: 'utf-8',
      }
    );

    const ParsedHtml = html.replace('{%VALIDATION_URL%}', this.url);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: ParsedHtml,
      text: plainText,
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
    const message = `Para validar su email, por favor, haga clic en el siguiente enlace: ${this.url}\n
      Si no ha se ha registrado en la plataforma, por favor ignore este mensaje.`;
    await this.send('EmailValidation', 'Validación de email', message);
  }

  async sendPasswordReset() {}
  async sendMemberInvitation() {}
};
