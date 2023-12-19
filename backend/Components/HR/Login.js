const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db=require('../DataBase/DataBase');
const {sendEmail,sendEmailWithDomain}= require('../Notifiers/EmailNotifier');
 

const router=express.Router()

const getHR=async (email)=>
{
    let result=await db.collection('HR').doc(email).get()
    result=result._fieldsProto
    if(result)
    {
        return true
    }
    else
    {
        return false;
    }
}

const addJob=async (HREmail,jobId,jobData)=>
{
    try
    {
        let response=await db.collection('HR').doc(HREmail).get()
        
        response=response._fieldsProto;
        response=response.Jobs.arrayValue.values
        
        let newJobs=[]
        response.forEach(element => {
    
            newJobs.push(element.stringValue)
            
            
        });
        newJobs.push(jobId)
        console.log(newJobs)
        response=await db.collection('HR').doc(HREmail).set({
            Jobs:newJobs
        })
    
        await db.collection('Jobs').doc(jobId).set({
            data:jobData,
            students:[]
        })
        return true
    }
    catch(err)
    {
        return false;
    }


}
router.post('/login',async (req,resp)=>
{
    let email=req.body.email
    console.log(email)
    let result=await getHR(email)
    try
    {

        if(result)
        {
            resp.send({
                ok:true,
                present:true
            })
        }
        else
        {
            resp.send({
                ok:true,
                present:false
            })
        }
    }
    catch(err)
    {
        resp.send({
            ok:false,
            err:err
        })
    }
})


router.post('/addjob',async (req,resp)=>
{
    
    let jobId=req.body.jobId
    let HREmail=req.body.HREmail
    let data=req.body.data
    console.log(HREmail)
    
    let response=await addJob(HREmail,jobId,data)
    if(response)
    {
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
        
        await sendEmail(HREmail,subject,body)
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

const getApplicants=async (jobId)=>
{
    try
    {

        let result=await db.collection('Jobs').doc(jobId).get()
        result=result._fieldsProto;
        result=result.students.arrayValue.values
        for(let i=0;i<result.length;i++)
        {
            result[i]=result[i].stringValue
        }
    
        return result
    }
    catch(err)
    {
        return null
    }
}


const getApplicantData=async (email)=>
{
    let result=await db.collection('students').doc(email).get()
    result=result._fieldsProto;
    result=result.data.stringValue;
    return result
}

const getAllApplicantDetails = async (list) => {
    const promises = list.map((email) => {
        return getApplicantData(email).then((data) => {
            return { email, data };
        });
    });

    return Promise.all(promises);
};

router.post('/applicants',async (req,resp)=>
{
    try
    {

        let jobId=req.body.jobId;
        console.log(jobId)
        let list=await getApplicants(jobId)
        let studentsData=await getAllApplicantDetails(list)
        
        
        if(list)
        {
            resp.send({
                ok:true,
                applications:studentsData
            })

        }
        else
        {
            resp.send({
                ok:true,
                applications:null
            })
        }
    }
    catch(err)
    {
        resp.send({
            ok:false,
            err:err
        })
    }
})
module.exports=router