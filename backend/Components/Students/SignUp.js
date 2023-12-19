const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain} = require('../Notifiers/EmailNotifier');


const router = express.Router()


const getStudentData = async (email) => {
    let data = await db.collection('students').doc(email).get()
    data = data._fieldsProto
    return data
}

const saveStudentRecord = async (email, data) => {
    let result = await db.collection('students').doc(email).set({
        data: data,
        Jobs: []
    })

    return result
}

const editStudentData = async (email, data) => {
    let result = await db.collection('students').doc(email).update({
        data: data
    })
    return result
}
router.post('/signup', async (req, resp) => {

    console.log("Request came");
    let email = req.body.email;
    let result = await getStudentData(email)
    if (result) {
        resp.send(
            {
                ok: true,
                present: true
            }
        )
    }
    else {
        try {
            let result = await saveStudentRecord(email, req.body.data)
            console.log(result)
            let subject = "Welcome to NARE!";
            let body = `
Hello Dear,

We wanted to extend a warm welcome to NARE. Thank you for signing up with us. Our team is delighted to have you join our community.

At NARE, we are committed to providing exceptional opportunities, and we are excited to help you in your search for an internship.

We believe that your journey with us will be rewarding and full of opportunities to learn and grow. Our platform is designed to assist you in finding meaningful internship experiences tailored to your interests and aspirations.

Should you have any questions or need assistance navigating our platform, please do not hesitate to reach out to our support team. We're here to help you every step of the way.

Once again, thank you for choosing NARE. We're thrilled to have you on board and look forward to supporting you in your pursuit of your career goals.

Best regards,

Team 
NARE
`;

            let respone = await sendEmail(email, subject, body)
            resp.send({
                ok: true,
                present: false
            })
        }
        catch (err) {
            resp.send({
                ok: false,
                err: err
            })
        }
    }

})

router.post('/check', async (req, resp) => {
    try {
        let result = await getStudentData(req.body.email)
        if (result) {
            resp.send({
                ok: true,
                present: true
            })
        }
        else {
            resp.send({
                ok: true,
                present: false
            })
        }

    }
    catch (err) {
        resp.send({
            ok: false,
            present: false
        })
    }

})


router.post('/login', async (req, resp) => {
    try {

        let email = req.body.email
        let result = await getStudentData(email)
        if (result) {

            resp.send({
                ok: true,
                present: true,
                data: result.data.stringValue
            })
        }
        else {
            resp.send({
                ok: true,
                present: false
            })
        }
    }
    catch (err) {
        resp.send({
            ok: false,
            err: err
        })
    }

})


router.post('/edit', async (req, resp) => {
    let email = req.body.email;
    let data = req.body.data
    console.log(req.body)
    try {
        let result = await editStudentData(email, data);
        if (result) {
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

router.post('/viewapplication', async (req, resp) => {

    try {
        let result = await getStudentData(req.body.email)
        resp.send({
            ok: true,
            data: result.data.stringValue
        })

    }
    catch (err) {
        resp.send({
            ok: false,
            err: err
        })
    }
})
module.exports = router