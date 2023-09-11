// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const send = (email, verificationToken) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email, // Change to your recipient
    from: "jack_byk@o2.pl", // Change to your verified sender
    subject: "E-mail verification Contacts",
    text: "and easy to do anywhere, even with Node.js",
    html: `<p style="font-size:16px;">Verify your e-mail address by clicking on this link - <a href="http://localhost:${process.env.PORT}/api/users/verify/${verificationToken}" target="_blank" rel="noopener noreferrer nofollow"><strong>Verification Link</strong></a></p>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
    send,
}