const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');

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

        let allJobs = await getAllJobs();


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
        let email=element.id
        let data=element._fieldsProto.data.stringValue
        allStudents.push({
            email:email,
            data:data
        })


        
    })

    
    
    return allStudents
}
router.get('/studentdata', async (req, resp) => {

    try
    {
        let allStudents=await getAllStudents();
        resp.send({
            ok:true,
            students:allStudents
        })

    }
    catch(err)
    {
        resp.send({
            ok:false,
            err:err
        })
    }
    
})
module.exports = router