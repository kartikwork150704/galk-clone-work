const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain} = require('../Notifiers/EmailNotifier');


const router = express.Router()
router.post('/',async(req,resp)=>
{
    let email=req.body.email;
    let subject=req.body.subject
    let emailBody=req.body.emailBody
    try
    {
        let response=await sendEmail(email,subject,emailBody)
        resp.send({
            ok:true,
            
        })
    }
    catch(err)
    {
        resp.send({
            ok:false
        })
    }   

})


module.exports = router;