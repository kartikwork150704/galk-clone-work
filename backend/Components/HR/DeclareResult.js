const express = require('express');
const bodyParser = require('body-parser');
const format = require('pg-format');
const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');

const DB = require('../Testing/SQLDatabase')
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
    Subject: Update on Your Job Application

    Dear Student,
    
    We appreciate your interest in the Job with Job Id ${jobId}. After careful consideration, we regret to inform you that we have chosen not to move forward with your application at this time.
    
    We received many qualified applications, and the decision was challenging. We want to express our gratitude for the time and effort you invested in the application process.
    
    We encourage you to keep an eye on our future job postings and wish you the best in your job search. Your skills and experience are valuable, and we hope you find the perfect opportunity that aligns with your career goals.
    
    Thank you again for considering our Organisation.
    
    Best regards,
    
    TEAM NARE
    `;

    const rejectEmailPromises = rejectedStudents.map((student) => sendEmail(student, rejectSubject, rejectedBody));

    let acceptedSubject = `Profile Accepted`;
    let acceptedBody = message;
    // const acceptEmailPromises = acceptedStudents.map((student) => sendEmail(student, acceptedSubject, acceptedBody));

    const allPromises = [...rejectEmailPromises];

    try {
        await Promise.all(allPromises);

        return true; // Return true if no errors occurred
    } catch (error) {

        return false; // Return false if there was an error
    }
};



const changeJobStatusSQL = async (jobId, acceptedStudents, rejectedStudents) => {
    const query1 = `
    UPDATE Jobs
    SET students = array_remove(students, '${rejectedStudents.join("','")}')
    WHERE jobId = '${jobId}';
`;

    let result1 = await DB.runQuery(query1)
    const values2 = rejectedStudents.map(email => `('${email}', '${jobId}', 'rejected')`).join(',');


    const query2 = `INSERT INTO jobStatus (email, jobId, status) VALUES ${values2}`;

    const values3 = acceptedStudents.map(email => `('${email}', '${jobId}', 'approved')`).join(',');
    const query3 = `INSERT INTO jobStatus (email, jobId, status) VALUES ${values3}`
    if (result1.error) {
        return false;
    }
    if (rejectedStudents.length > 0) {
        let result2 = await DB.runQuery(query2)
        if (result2.error) {
            return false
        }

    }
    if (acceptedStudents.length > 0) {
        let result3 = await DB.runQuery(query3)
        if (result3.error) {
            return false
        }

    }

    return true;





}
router.post('/', async (req, resp) => {
    let rejectedStudents = req.body.rejectedStudents;
    let acceptedStudents = req.body.acceptedStudents;
    let jobId = req.body.jobId
    let message = req.body.message;
    console.log(req.body)

    await changeJobStatusSQL(jobId, acceptedStudents, rejectedStudents)
    await notifyStudents(jobId, acceptedStudents, rejectedStudents, message)
    resp.send({
        ok: true
    })




})


const AssignTask = async (taskData) => {

    let acceptedStudents = taskData.acceptedStudents
    let jobId = taskData.jobId
    let taskStatement = taskData.taskStatement
    let deadline = taskData.deadline
    const dataToInsert = acceptedStudents.map((studentID) => [
        studentID,
        jobId,
        taskStatement,
        'pending',
        deadline,
    ]);
    const query = format('INSERT INTO Task (email, JobID, taskStatement, status, deadline) VALUES %L', dataToInsert);
    let result = await DB.runQuery(query)

}

const notifyAboutTask = async (taskData) => {
    let taskstatement = taskData.taskStatement;
    let acceptedStudents = taskData.acceptedStudents
    let subject = `Task Notification for JobID : ${taskData.jobId}`; // Subject for the email
    let body = `Dear Student,\n\n`;
    body += `We hope this message finds you well. We are really happy to notify you that you are selected for the next stage of recruitment i.e. Task completion.\n\n`;
    body += `We would like to inform you that a new task has been assigned to you.\n\n`;
    body += `Task Statement:\n"${taskstatement}"\n\n`;
    body += `The successful completion of this task is crucial to our ongoing projects. It is expected to be completed within the given deadline.\n\n`;
    body += `You are encouraged to make use of all available resources and take your time to submit quality work.\n\n`;
    body += `Please note that you can submit your work through the website in your profile portal. This task is a valuable contribution to our objectives, and we are counting on your active participation.\n\n`;
    body += `Thank you for your prompt attention to this matter.\n\n`;
    body += `Should you have any questions or need further clarification, please do not hesitate to reach out.\n\n`;
    body += `Best Regards,\nTEAM NARE`;

    const notifyAllStudents = async (acceptedStudents, subject, body) => {
        // Create an array of promises for sending emails
        const emailPromises = acceptedStudents.map(async (student) => {
            await sendEmail(student, subject, body);
        });

        // Execute all promises in parallel
        await Promise.all(emailPromises);
    };

    // Usage
    notifyAllStudents(acceptedStudents, subject, body)
        .then(() => {
            console.log('All emails have been sent successfully!');
        })
        .catch((error) => {
            console.error('Error sending emails:', error);
        });
};

router.post('/assigntask', async (req, resp) => {
    let taskData = req.body;
    try {
        await AssignTask(taskData)
        await notifyAboutTask(taskData)
        resp.send({
            ok: true
        })

    }
    catch (err) {
        console.log(err)
        resp.send({
            ok: false
        })
    }



})
module.exports = router