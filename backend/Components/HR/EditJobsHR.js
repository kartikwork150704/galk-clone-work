const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db=require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain}= require('../Notifiers/EmailNotifier');
const DB = require('../Testing/SQLDatabase');
 

const router=express.Router()

const editJobSQL=async (jobId,newData)=>
{
    let query=`update Jobs set data='${newData}' where JobId='${jobId}'`
    let result=await DB.runQuery(query)
    if(!result.error)
    {
        return true
    }
    return false;
}
router.post('/',async (req,resp)=>
{
    let jobId=req.body.jobId;
    let data=req.body.data
    
    try
    {
        // let result=await db.collection('Jobs').doc(jobId).update({
        //     data:data
        // })
        let result=await editJobSQL(jobId,data)
        resp.send({
            ok:true
        })

    }
    catch(err)
    {
        console.log(err)
        resp.send({
            ok:false
        })
    }
})


module.exports=router