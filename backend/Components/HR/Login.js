const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');
const DB = require('../Testing/SQLDatabase');


const router = express.Router()

const getHR = async (email) => {
    let result = await db.collection('HR').doc(email).get()
    result = result._fieldsProto
    if (result) {
        return true
    }
    else {
        return false;
    }
}

const addJob = async (HREmail, jobId, jobData) => {
    try {
        let response = await db.collection('HR').doc(HREmail).get()

        response = response._fieldsProto;
        response = response.Jobs.arrayValue.values

        let newJobs = []
        response.forEach(element => {

            newJobs.push(element.stringValue)


        });
        newJobs.push(jobId)
        console.log(newJobs)
        response = await db.collection('HR').doc(HREmail).set({
            Jobs: newJobs
        })

        await db.collection('Jobs').doc(jobId).set({
            data: jobData,
            students: []
        })
        return true
    }
    catch (err) {
        return false;
    }


}

const addJobSQL = async (HREmail, jobId, jobData) => {
    let query1 = `
    UPDATE HR
SET jobs = ARRAY_APPEND(jobs, '${jobId}')
WHERE email = '${HREmail}';
`
    let query2 = `INSERT into Jobs(JobId,data) values ('${jobId}','${jobData}')`
    let result1 = await DB.runQuery(query1)
    let result2 = await DB.runQuery(query2)
    if (!result1.error && !result2.error) {
        return true;
    }
    else {
        return false;
    }


}

const checkHRSQL = async (email) => {
    let query = `select count(*) from HR where email='${email}'`
    let result = await DB.runQuery(query)
    if (result.result[0].count != 0) {
        return true
    }
    else {
        return false
    }
}
router.post('/login', async (req, resp) => {
    let email = req.body.email
    console.log(email)
    let result = await checkHRSQL(email)
    try {

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
            err: err
        })
    }
})


router.post('/addjob', async (req, resp) => {

    let jobId = req.body.jobId
    let HREmail = req.body.HREmail
    let data = req.body.data
    console.log(HREmail)

    let response = await addJobSQL(HREmail, jobId, data)
    if (response) {
        let subject = "Job Added Successfully :)";
        let body = `
        Hello dear HR,
        
        Thank you for adding the job opportunity at NARE. The job has been successfully added with the Job ID: ${jobId}. You can view the list of candidates who have applied on the portal.
        
        At NARE, we are committed to offering meaningful opportunities for aspiring individuals, and your contribution plays a vital role in achieving this goal.
        
        Should you require any further assistance or have queries regarding the application process, feel free to reach out to our support team. We are dedicated to providing the help you need.
        
        We appreciate your effort in enriching our platform and creating valuable opportunities for prospective candidates.
        
        Best regards,
        
        Team
        NARE
        `;

        await sendEmail(HREmail, subject, body)
        resp.send({
            ok: true
        })
    }
    else {
        resp.send({
            ok: false
        })
    }
})

const getApplicants = async (jobId) => {
    try {

        let result = await db.collection('Jobs').doc(jobId).get()
        result = result._fieldsProto;
        result = result.students.arrayValue.values
        for (let i = 0; i < result.length; i++) {
            result[i] = result[i].stringValue
        }

        return result
    }
    catch (err) {
        return null
    }
}


const getApplicantData = async (email) => {
    let result = await db.collection('students').doc(email).get()
    result = result._fieldsProto;
    result = result.data.stringValue;
    return result
}

const getApplicantDataSQL = async (email) => {
    let query = `select data from Students where email='${email}'`
    let result = await DB.runQuery(query)

    return result.result[0].data
}
const getAllApplicantDetails = async (list) => {


    const results = [];

    for (let i = 0; i < list.length; i++) {
        const email = list[i];
        const promise = getApplicantDataSQL(email).then((data) => {
            return { email, data };
        });
        results.push(promise);
    }
    console.log(results)
    return Promise.all(results);

};

const getApplicantsSQL = async (jobId) => {
    let query = `SELECT s.*
    FROM Jobs j
    CROSS JOIN unnest(j.students) AS student_id
    JOIN Students s ON s.email = student_id
    WHERE j.jobId = '${jobId}';
    
    `;
    let result = await DB.runQuery(query);
    // console.log(result.result[0].students)
    console.log(result)
    return result.result
}
router.post('/applicants', async (req, resp) => {
    try {

        let jobId = req.body.jobId;

        let studentsData = await getApplicantsSQL(jobId)
        // let studentsData = await getAllApplicantDetails(list)
        // console.log(list)


        if (studentsData) {
            resp.send({
                ok: true,
                applications: studentsData
            })

        }
        else {
            resp.send({
                ok: true,
                applications: null
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
module.exports = router