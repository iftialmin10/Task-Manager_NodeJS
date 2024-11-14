const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ifti3edu3cse@gmail.com',
    subject: 'Thanks for joining in.!',
    text: `Welcome to the app, ${name}. Let me know how you get alone with the app.`,
  });
};

const sendCancelationMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ifti3edu3cse@gmail.com',
    subject: 'Cancelation message',
    text: `Sad ${name} you are no longer with us. Can you please tell us about your cancellation`,
  });
};

// For multiple things to export we use as object
module.exports = {
  sendWelcomeEmail,
  sendCancelationMail,
};
