const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');


const router = express.Router()

const changeJobStatus = async (jobId, rejectedStudents) => {
    if (rejectedStudents.length == 0) {
        return true
    }
    try {

        let result = await db.collection('Jobs').doc(jobId).get()
        result = result._fieldsProto;
        result = result.students.arrayValue.values
        for (let i = 0; i < result.length; i++) {
            result[i] = result[i].stringValue
        }
        result = result.filter(item => !rejectedStudents.includes(item))
        await db.collection('Jobs').doc(jobId).update({
            students: result
        })
        return true
    }
    catch (err) {
        return false
    }
}


const notifyStudents = async (jobId, acceptedStudents, rejectedStudents, message) => {
    let rejectSubject = "Profile Rejected";
    let rejectedBody = `
        Dear Candidate,

        We regret to inform you that after careful consideration, your profile for Job ID: ${jobId} has been rejected.

        Please understand that the decision was made after a thorough review process, and while your qualifications are commendable, we have proceeded with candidates whose profiles more closely align with our current requirements.

        We genuinely appreciate your interest in joining NARE and encourage you to explore other opportunities on our platform. Your dedication and skills are valuable, and we hope to match you with a more suitable opportunity in the future.

        Should you have any queries or require feedback regarding your application, please feel free to reach out to our support team. We are available to assist you.

        Thank you for considering NARE, and we wish you all the best in your future endeavors.

        Best regards,
        Team NARE
    `;

    const rejectEmailPromises = rejectedStudents.map((student) => sendEmail(student, rejectSubject, rejectedBody));

    let acceptedSubject = `Profile Accepted`;
    let acceptedBody = message;
    const acceptEmailPromises = acceptedStudents.map((student) => sendEmail(student, acceptedSubject, acceptedBody));

    const allPromises = [...rejectEmailPromises, ...acceptEmailPromises];

    try {
        await Promise.all(allPromises);
        
        return true; // Return true if no errors occurred
    } catch (error) {
       
        return false; // Return false if there was an error
    }
};

router.post('/', async (req, resp) => {
    let rejectedStudents = req.body.rejectedStudents;
    let acceptedStudents = req.body.acceptedStudents;
    let jobId = req.body.jobId
    let message = req.body.message;
    try {
        let result = await changeJobStatus(jobId, rejectedStudents)
        await notifyStudents(jobId,acceptedStudents,rejectedStudents,message);
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


module.exports = router