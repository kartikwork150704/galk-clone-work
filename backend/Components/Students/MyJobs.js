const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');
const DB = require('../Testing/SQLDatabase')

const router = express.Router()

const getMyJobs = async (email) => {
    let query = `SELECT j.jobId, j.data
    FROM Students s
    JOIN Jobs j ON s.jobsId @> ARRAY[j.jobId]::TEXT[] 
    WHERE s.email = '${email}'; 
    `
    let result = await DB.runQuery(query)
    return result.result
}
router.post('/student/myjobs', async (req, resp) => {

    try
    {
        let email = req.body.email
        let jobs=await getMyJobs(email)
        resp.send({
            ok:true,
            jobs:jobs
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

const checkStudentJobStatus=async (email,jobId)=>
{
    console.log(email,jobId)
    let query=`select * from JobStatus where email='${email}' and jobId='${jobId}'`
    let result=await DB.runQuery(query)
    if(result.result[0])
    {
        return result.result[0].status
    }
    else
    {
        return 'In-Progress'
    }
}
router.post('/student/myjob/checkstatus',async (req,resp)=>
{
    let email=req.body.email
    let jobId=req.body.jobId
    try
    {
        let status=await checkStudentJobStatus(email,jobId)
        resp.send({
            ok:true,
            status:status
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