const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain} = require('../Notifiers/EmailNotifier');


const router = express.Router()

const Reject = async (email, jobId) => {
    try {

        let response = await db.collection('Jobs').doc(jobId).get();
        response = response._fieldsProto;
        response = response.students.arrayValue.values
        let newArray = []
        for (let i = 0; i < response.length; i++) {
            if (response[i].stringValue != email) {
                newArray.push(response[i].stringValue);
            }
        }
        await db.collection('Jobs').doc(jobId).update({
            students: newArray
        })

        return true
    }
    catch (err) {
        return false
    }

}
router.post('/update', async (req, resp) => {
    try {

        let jobId = req.body.jobId;
        let email = req.body.email
        let status = req.body.status
        if (!status) {
            let result = await Reject(email, jobId)
            let subject = "Profile Rejected";
            let body = `
Dear Candidate,

We regret to inform you that after careful consideration, your profile for Job ID: ${jobId} has been rejected.

Please understand that the decision was made after a thorough review process, and while your qualifications are commendable, we have proceeded with candidates whose profiles more closely align with our current requirements.

We genuinely appreciate your interest in joining NARE and encourage you to explore other opportunities on our platform. Your dedication and skills are valuable, and we hope to match you with a more suitable opportunity in the future.

Should you have any queries or require feedback regarding your application, please feel free to reach out to our support team. We are available to assist you.

Thank you for considering NARE, and we wish you all the best in your future endeavors.

Best regards,

Team NARE

`;

            await sendEmail(email, subject, body);
        }
        else {
            let subject = "Profile Accepted";
            let body = `
Dear Candidate,

We are delighted to inform you that your profile for Job ID: ${jobId} has been accepted.

Congratulations on this achievement! Your qualifications and experience align well with our requirements, and we believe you would be an excellent addition to our team.

As the next step, we kindly request you to submit a simple task. Further information regarding the task will be communicated to you shortly.

At NARE, we appreciate your dedication and look forward to your continued engagement in the recruitment process.

Should you have any questions or require clarification regarding the task or any other information, please do not hesitate to contact our support team. We are here to assist you throughout the process.

Thank you for considering NARE, and we are excited about the possibility of having you join our team.

Best regards,

Team NARE

`;

            await sendEmail(email, subject, body);
        }
        resp.send({
            ok: true
        })
    }
    catch (err) {
        resp.send({
            ok: false
        })
    }

})

router.post('/sendemail', async (req, resp) => {
    try {
        let domainName=req.body.domainName
        let email = req.body.email
        let subject = req.body.subject
        let body = req.body.body
        await sendEmailWithDomain(email, subject, body,domainName)
        resp.send({
            ok: true
        })
    }
    catch (err) {
        resp.send({
            ok: false
        })
    }
})

module.exports = router;