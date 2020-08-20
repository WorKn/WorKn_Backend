const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Soporte WorKn <soporte.worknrd@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log("Email error: "+error.message);
    } else {
      console.log( "email sent to: "+ mailOptions.to);
    }
  });
};

module.exports = sendEmail;
