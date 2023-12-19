const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db=require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain}= require('../Notifiers/EmailNotifier');
 

const router=express.Router()

router.post('/',async (req,resp)=>
{
    let jobId=req.body.jobId;
    let data=req.body.data
    console.log(req.body)
    try
    {
        let result=await db.collection('Jobs').doc(jobId).update({
            data:data
        })
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