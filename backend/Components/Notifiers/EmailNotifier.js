const nodemailer = require('nodemailer');

function sendEmail(emailId, subject, emailBody) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.sendinblue.com',
            port: 587,
            secure: false,
            auth: {
                user: 'kartikyadavwork01@gmail.com',
                pass: 'dMtcR4OAC0JsZIqm'
            }
        });

        const mailConfigurations = {
            from: 'noreply@hiring-nare.com',
            to: emailId,
            subject: subject,
            text: emailBody
        };

        transporter.sendMail(mailConfigurations, function (error, info) {
            if (error) {
                // If there's an error, reject the Promise with the error
                reject(error);
            } else {
                // If email sent successfully, resolve the Promise
                resolve(true);
            }
        });
    });
}

function sendEmailWithDomain(emailId, subject, emailBody,domainName) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.sendinblue.com',
            port: 587,
            secure: false,
            auth: {
                user: 'kartikyadavwork01@gmail.com',
                pass: 'dMtcR4OAC0JsZIqm'
            }
        });

        const mailConfigurations = {
            from: domainName,
            to: emailId,
            subject: subject,
            text: emailBody
        };

        transporter.sendMail(mailConfigurations, function (error, info) {
            if (error) {
                // If there's an error, reject the Promise with the error
                reject(error);
            } else {
                // If email sent successfully, resolve the Promise
                resolve(true);
            }
        });
    });
}
module.exports = {sendEmail,sendEmailWithDomain};
