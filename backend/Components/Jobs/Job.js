const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain} = require('../Notifiers/EmailNotifier');


const router = express.Router()
function getUniqueElements(array1, array2) {
    const uniqueElements = [];  
    
    for (let i = 0; i < array2.length; i++) {
        let isUnique = true;

        for (let j = 0; j < array1.length; j++) {
            if (array2[i] === array1[j].stringValue) {
                isUnique = false;
                break;
            }
        }

        if (isUnique) {
            uniqueElements.push(array2[i]);
        }
    }

    return uniqueElements;
}

const getStudentJobs = async (email) => {
    let response = await db.collection('students').doc(email).get()
    response = response._fieldsProto
    response = response.Jobs.arrayValue.values;
    let allJobs = []
    let allJobsSnapShot = await db.collection('Jobs').get()
    allJobsSnapShot.forEach((element) => {
        // console.log(element.id)
        allJobs.push(element.id)
    })
    allJobs=getUniqueElements(response,allJobs)
    let allJobData=[]
    for(let i=0;i<allJobs.length;i++)
    {
        let element=allJobs[i]
        let data1=await db.collection('Jobs').doc(element).get()
        data1=data1._fieldsProto.data
        if(data1)
        {
            allJobData.push({
                jobId:element,
                data:data1.stringValue
            })
        }

    }
    
    return allJobData
}


const applyForJob=async (email,jobId)=>
{

    try{

        let response=await db.collection('students').doc(email).get()
        response=response._fieldsProto;
        response=response.Jobs.arrayValue.values
        
        let newJobs=[]
        response.forEach(async (element)=>
        {
            element=element.stringValue
            
            newJobs.push(element)
        })
        newJobs.push(jobId);
    
        response=await db.collection('students').doc(email).update({
            Jobs:newJobs
        })
    
        response=await db.collection('Jobs').doc(jobId).get()
        response=response._fieldsProto;
        response=response.students.arrayValue.values
        let newSudents=[]
        response.forEach((element)=>
        {
            newSudents.push(element.stringValue)
        })
        newSudents.push(email)
    
        response=await db.collection('Jobs').doc(jobId).update({
            students:newSudents
        })

        return true
    }
    catch(err)
    {
        return false;
    }
}
router.post('/getjobs/student', async (req, resp) => {
    let email = req.body.email
    
    try
    {
        let jobs=await getStudentJobs(email);
        resp.send({
            ok:true,
            jobs:jobs
        })

    }
    catch(err)
    {
        console.log(err)
        resp.send({
            ok:false,
            err:err
            
        })
    }

})

router.post('/apply',async (req,resp)=>
{
    let email=req.body.email;
    let jobId=req.body.jobId
    try
    {
        let result=await applyForJob(email,jobId)
        if(result)
        {
            let subject = "Application Submitted Successfully!";
let body = `
Dear Candidate,

Thank you for submitting your application on the NARE portal. Your application has been successfully received.

At NARE, we highly value your interest in joining our team. Our recruitment team will carefully review your application and will notify you by email regarding the further steps in the application process.

Should you have any questions or need clarification about the application or the recruitment process, please do not hesitate to contact our support team. We are here to assist you throughout the process.

We appreciate your interest in becoming part of NARE. Wishing you the best of luck with your application!

Best regards,
Team NARE

`;


            await sendEmail(email,subject,body)
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

    }
    catch(err)
    {
        resp.send({
            ok:false
        })
    }
    
})


const getApplicants= async (HREmail)=>
{
    try
    {
        let response=await db.collection('HR').doc(HREmail).get()
        response=response._fieldsProto
        response=response.Jobs.arrayValue.values
        console.log(response)
        let jobData=[]
        for(let i=0;i<response.length;i++)
        {
            let jobId=response[i].stringValue
            
            let result=await db.collection('Jobs').doc(jobId).get()
            result=result._fieldsProto;
            let data=result.data.stringValue;
            
            result=result.students.arrayValue.values
            
           
            jobData.push({jobId:jobId,data:data})
    
            
        }
        
        return jobData

    }
    catch(err)
    {
        console.log(err)
        return false;
    }
}
router.post('/getapplicants',async (req,resp)=>
{
    let HREmail=req.body.email
    
    try
    {
        let jobData=await getApplicants(HREmail)
        resp.send({
            ok:true,
            jobData:jobData
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