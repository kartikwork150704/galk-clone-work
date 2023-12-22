const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');

const DB = require('../Testing/SQLDatabase')
DB.connect()
const getAllJobs = async () => {
    let allJobs = []
    let allJobsSnapShot = await db.collection('Jobs').get()
    allJobsSnapShot.forEach((element) => {
        // console.log(element.id)


        let students = element._fieldsProto.students.arrayValue.values
        for (let i = 0; i < students.length; i++) {
            students[i] = students[i].stringValue
        }

        allJobs.push({
            jobId: element.id,
            jobData: element._fieldsProto.data.stringValue,
            students: students
        })
    })

    return allJobs
}

const getAllJobsSQL = async () => {
    let query = `select * from Jobs`;
    let result = await DB.runQuery(query)
    if (!result.error) {
        result = result.result[0]

        return {
            jobId: result.jobid,
            jobData: result.data,
            students: result.students

        }

    }
    else {
        return {
            error: true
        }
    }
}
const router = express.Router()

router.post('/login', async (req, resp) => {
    let email = req.body.email
    if (email == "deepanshusharma204@gmail.com" || email == "kartik150704@gmail.com") {
        resp.send({
            ok: true,

        })
    }
    else {
        resp.send({
            ok: false
        })
    }
})


router.get('/alldata', async (req, resp) => {

    try {

        // await getAllJobsSQL()
        let allJobs = await getAllJobsSQL();


        resp.send({
            ok: true,
            jobData: allJobs
        })
    }
    catch (err) {
        resp.send({
            ok: false,
            err: err
        })
    }
})


const getAllStudents = async () => {
    let allStudents = []
    let allStudentsSnapShot = await db.collection('students').get()
    allStudentsSnapShot.forEach((element) => {
        let email = element.id
        let data = element._fieldsProto.data.stringValue
        allStudents.push({
            email: email,
            data: data
        })



    })



    return allStudents
}

const getAllStudentsSQL = async () => {
    let query = `select email,data from Students`
    let result = await DB.runQuery(query)
    result = result.result
    return result

}
router.get('/studentdata', async (req, resp) => {

    try {
        let allStudents = await getAllStudentsSQL();
        resp.send({
            ok: true,
            students: allStudents
        })

    }
    catch (err) {
        resp.send({
            ok: false,
            err: err
        })
    }

})


const TransferData = async () => {
    let studentSnapshot = await db.collection('students').get()
    let StudentData = []
    for (let i = 0; i < studentSnapshot.docs.length; i++) {
        let doc = studentSnapshot.docs[i];
        let email = doc.id
        doc = doc._fieldsProto;

        let data = doc.data.stringValue
        let Jobs = doc.Jobs.arrayValue.values;
        for (let j = 0; j < Jobs.length; j++) {
            Jobs[j] = Jobs[j].stringValue
        }
        StudentData.push({
            email: email,
            data: data,
            Jobs: Jobs
        })

    }
    let count = 0;
    for (let i = 0; i < StudentData.length; i++) {
        let email = StudentData[i].email
        let data = StudentData[i].data
        let Jobs = StudentData[i].Jobs
        if (Jobs.length > 0) {
            let query = `
        INSERT INTO Students (email, data, jobsId)
        VALUES ('${email}', '${data}', ARRAY[${Jobs.map(job => `'${job}'`).join(',')}]);
    `;
            let result = await DB.runQuery(query)
            if (result.error) {
                console.log(result);
                break;
            }
            else {
                count++;
            }

        }
        else {
            let query = `
        INSERT INTO Students (email, data)
        VALUES ('${email}', '${data}');
    `;
            let result = await DB.runQuery(query)
            if (result.error) {
                console.log(result);
                break;
            }
            else {
                count++;
            }
        }
    }

    console.log(count, " ", StudentData.length)
}

const TransferJobs = async () => {
    let allJobs = []
    let JobsSnapshot = await db.collection('Jobs').get()
    for (let i = 0; i < JobsSnapshot.docs.length; i++) {
        let doc = JobsSnapshot.docs[i];
        let jobId = doc.id
        doc = doc._fieldsProto;

        let data = doc.data.stringValue
        let students = doc.students.arrayValue.values;
        for (let j = 0; j < students.length; j++) {
            students[j] = students[j].stringValue
        }
        allJobs.push({
            jobId: jobId,
            data: data,
            students: students
        })

    }
    for (let i = 0; i < allJobs.length; i++) {
        let jobId = allJobs[i].jobId
        let data = allJobs[i].data
        let students = allJobs[i].students
        let query = `
    INSERT INTO Jobs (JobId, data, students)
    VALUES ('${jobId}', '${data}', ARRAY[${students.map(student => `'${student}'`).join(',')}]);
`;
        let result = await DB.runQuery(query)
        if (result.error) {
            console.log(query)
            break;
        }
        else {
            console.log("Success")
        }

    }

}
const DB2 = require('../Testing/DataBase2')
const TransferStudents = async () => {
    let query = `select * from Students`
    let result = await DB.runQuery(query)
    studentsData = result.result
    // console.log(result[0])
    const valuesWithData = [];
    const valuesWithoutData = [];
    studentsData.forEach((student) => {
        if (Array.isArray(student.jobsid) && student.jobsid.length > 0) {
            const jobIds = student.jobsid.map(id => `'${id}'`).join(',');
            valuesWithData.push(`('${student.email}', '${student.data}', ARRAY[${jobIds}] )`);
        } else {
            valuesWithoutData.push(`('${student.email}', '${student.data}')`);
        }
    });

    const queryWithData = `
        INSERT INTO Students (email, data, jobsid)
        VALUES ${valuesWithData.join(',')};
    `;

    const queryWithoutData = `
        INSERT INTO Students (email, data)
        VALUES ${valuesWithoutData.join(',')};
    `;
    let result2 = await DB2.runQuery(queryWithData)
    let result3 = await DB2.runQuery(queryWithoutData)
    console.log(result2, result3)
}


const TransferHR = async () => {
    let query1 = `select * from HR`
    let result = await DB.runQuery(query1)
    let HRData = result.result
    let query = '';
    HRData.forEach(({ email, jobs, status, data }) => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const jobValues = jobs.map(job => `'${job}'`).join(',');
            query += `INSERT INTO HR (email, jobs, status, data) VALUES ('${email}', ARRAY[${jobValues}], '${status}', '${data}');\n`;
        } else {
            query += `INSERT INTO HR (email, jobs, status, data) VALUES ('${email}', null, '${status}', '${data}');\n`;
        }
    });

    let result2 = await DB2.runQuery(query)
    console.log(result2)
}

const TransferJobs1 = async () => {
    let query1 = `select * from Jobs`
    let result = await DB.runQuery(query1)
    let jobsData = result.result
    let query = `
  INSERT INTO Jobs (jobid, data, students)
  VALUES
`;

    // Constructing the VALUES part of the query for each job data
    jobsData.forEach((job, index) => {
        const jobid = job.jobid;
        const data = job.data;
        const studentsArray = job.students.map(email => `'${email}'`).join(',');

        query += `('${jobid}', '${data}', ARRAY[${studentsArray}])`;

        if (index !== jobsData.length - 1) {
            query += ',';
        }
    });

    let result2 = await DB2.runQuery(query)
    console.log(result2)

}

const TransferJobStatus = async () => {
    let query1 = `select * from JobStatus`
    let result = await DB.runQuery(query1)
    let JobStatusData = result.result
    let query = `
  INSERT INTO JobStatus (email, jobid, status)
  VALUES
`;

    // Constructing the VALUES part of the query for each JobStatusData object
    JobStatusData.forEach((data, index) => {
        const { email, jobid, status } = data;
        query += `('${email}', '${jobid}', '${status}')`;

        if (index !== JobStatusData.length - 1) {
            query += ',';
        }
    });

    let result2 = await DB2.runQuery(query)
    console.log(result2)

}

const TransferTasks = async () => {
    let query1 = `select * from Task`
    let result = await DB.runQuery(query1)
    let TaskData = result.result
    let query = `
  INSERT INTO Task (email, jobid, taskstatement, status, deadline, taskwork)
  VALUES
`;

    // Constructing the VALUES part of the query for each TaskData object
    TaskData.forEach((data, index) => {
        const { email, jobid, taskstatement, status, deadline, taskwork } = data;
        query += `('${email}', '${jobid}', '${taskstatement}', '${status}', '${deadline}', ${taskwork !== null ? `'${taskwork}'` : 'null'})`;

        if (index !== TaskData.length - 1) {
            query += ',';
        }
    });

    let result2=await DB2.runQuery(query)
    console.log(result2)
}


let TransferAllData=async ()=>
{

    let query=`
    delete from Students;
    delete from JobStatus;
    delete from Jobs;
    delete from Task;
    delete from HR;

    
    `

    await DB2.runQuery(query)
    await TransferStudents()
    await TransferHR()
    await TransferJobs1()
    await TransferTasks()
    await TransferTasks()
}
router.get('/transferdata', async (req, resp) => {
    await TransferAllData()
    resp.send(true)
})
module.exports = router