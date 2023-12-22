const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');
const DB = require('../Testing/SQLDatabase');


const router = express.Router()

const checkHRSQL=async (email)=>
{
    let query=`select count(*) from HR where email='${email}'`
    let result=await DB.runQuery(query)
    if(result.result[0].count!=0)
    {
        return true
    }
    else
    {
        return false
    }
}
router.post('/hr/check',async (req,resp)=>
{
    let result=await checkHRSQL(req.body.email)
    try
    {
        resp.send({
            ok:true,
            present:result
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

const addHRSQL=async (HRData)=>
{
    let query=`insert into HR (email,data,status) values ('${HRData.email}','${HRData.data}','pending')`
    let result=await DB.runQuery(query)
    if(!result.error)
    {
        return true
    }
    else
    {
        return false
    }
}
router.post('/hr/signup',async (req,resp)=>
{
    let HRData=req.body;
    let result=await addHRSQL(HRData)
    if(result)
    {
        resp.send({
            ok:true
        })
    }
    else
    {
        resp.send({
            ok:false
        })
    }
})

const getHRData=async (email)=>
{
    let query=`select data,status from HR where email='${email}' `
    let result=await DB.runQuery(query)
    return result.result[0]
}
router.post('/hr/getdata',async (req,resp)=>
{
    let email=req.body.email
    try
    {
        let result=await getHRData(email)
        resp.send({
            ok:true,
            data:result.data,
            status:result.status
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

const getPendingHR=async ()=>
{
    let query =`select * from HR where status='pending'`
    let result=await DB.runQuery(query)
    return result.result
}
router.get('/hr/getpending',async (req,resp)=>
{
    try
    {
        let result=await getPendingHR()
        resp.send({
            ok:true,
            data:result
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