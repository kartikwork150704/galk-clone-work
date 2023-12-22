const express = require('express');
const bodyParser = require('body-parser');
const format = require('pg-format');
const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');

const DB = require('../Testing/SQLDatabase')
const router = express.Router()

const getStudentTasks = async (email) => {
    let query = `select  *  from Task where email='${email}'`
    let result = await DB.runQuery(query)
    result = result.result
    return result
}
router.post('/task/student/getdata', async (req, resp) => {
    let email = req.body.email;
    try {
        let result = await getStudentTasks(email)
        resp.send({
            ok: true,
            tasks: result
        })

    }
    catch (err) {
        resp.send({
            ok: false,
            err: err
        })
    }


})

const submitTask = async (taskData) => {

    console.log(taskData)
    let query = `update Task set status='done' ,taskWork ='${taskData.taskWork}'
    where email='${taskData.email}' and taskStatement='${taskData.taskStatement}' and jobId='${taskData.jobId}'

    `
    let query2=`select * from Task`
    console.log(query)
    let result = await DB.runQuery(query)
    console.log(result.result)
    // return true
    if (!result.error) {
        return true
    }
    return false
}
router.post('/task/submittask', async (req, resp) => {
    let taskData = req.body
    console.log(taskData)
    let result = await submitTask(taskData)
    
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
})

const getTaskDetailsHR=async (jobId)=>
{
    let query=`select email , taskstatement,taskwork from Task where jobId='${jobId}'`
    let result=await DB.runQuery(query)
    return result.result
}
router.post('/task/hr/getdata',async (req,resp)=>
{
    try
    {

        let data=await getTaskDetailsHR(req.body.jobId)
        resp.send({
            ok:true,
            data:data
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
module.exports = router;    