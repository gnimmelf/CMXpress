const debug = require('debug')('cmx:service:mailService');
const fs = require('fs');
const { join } = require('path');
const nodemailer = require('nodemailer');

module.exports = ({ nodemailerTransport }) => {
  const transporter = nodemailer.createTransport(nodemailerTransport);

  const sendMail = ({ senderName, recieverEmail, subjectStr, textOrHtml }) => {

    return new Promise((resolve, reject) => {
      // Setup e-mail data with unicode symbols
      const mail_options = {
        from: senderName + ' <' + mailConfig.senderEmail + '>',
        to: recieverEmail,
        subject: subjectStr,
      };

      mail_options[textOrHtml.startsWith('<') ? 'html' : 'text'] = textOrHtml;

      debug('mail_options', mail_options)

      // Send mail with defined transport object
      transporter.sendMail(mail_options, (err, data) => {
        err ? reject(err) : resolve(data)
      });
    });

  };

  /**
   * Public
   */
  return {
    sendMail: sendMail
  }

}
