const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');

const DB = require('../Testing/SQLDatabase');
const { verify } = require('crypto');

const router = express.Router()

const VerifyHR = async (email) => {
    let query = `update HR set status='approved' where email='${email}'`
    let result = await DB.runQuery(query)
    if (!result.error) {
        return true
    }
    return false
}
router.post('/admin/verifyHR', async (req, resp) => {
    let email = req.body.email
    try {
        let result = await VerifyHR(email)
        if (result) {
            let subject = `Profile Verified`
            let body = `Dear HR,\n\nYour profile has been successfully verified on the Nare Portal. Thank you for registering!\n\nBest regards,\nThe Nare Portal Team`;
            await sendEmail(email, subject, body)
            resp.send({
                ok: true
            })

        }
        else {
            resp.send({
                ok: false
            })

        }

    }
    catch (err) {
        resp.send({
            ok: false
        })
    }
})
module.exports = router