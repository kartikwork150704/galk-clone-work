const nodemailer = require('nodemailer');


let auth1={
    user:'kartikyadavwork01@gmail.com',
    pass:'dMtcR4OAC0JsZIqm'
}

let auth2={
    user:'kartik150704@gmail.com',
    pass:'aVydrgN5sIEXMxbj'
}

let auth3={
    user:'deepanshusharma204@gmail.com',
    pass:'RDXbOdChrYWzKEnB'
}

let auth4={
    user:'upanshusharma0@gmail.com',
    pass:'8HgLcI2sxDMWYnbh'
}

let auth=auth4
function sendEmail(emailId, subject, emailBody) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.sendinblue.com',
            port: 587,
            secure: false,
            auth: auth
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
            auth: auth
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
