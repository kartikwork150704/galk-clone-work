require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())

const student=require('./Components/Students/SignUp')
app.use('/student',student)


const hr=require('./Components/HR/Login')
app.use('/hr',hr);

const jobs=require('./Components/Jobs/Job')
app.use('/jobs',jobs);

const sendEmail=require('./Components/Notifiers/SendEmail')
app.use('/sendemail',sendEmail)


const jobStatus=require('./Components/Jobs/JobStatus')
app.use('/jobstatus',jobStatus)

const Admin=require('./Components/Admin/Admin')
app.use('/admin',Admin);

const EditJob=require('./Components/HR/EditJobsHR')
app.use('/editjobHR',EditJob)

const DeclareResult=require('./Components/HR/DeclareResult')
app.use('/declareresult',DeclareResult)

const HRSignup=require('./Components/HR/SignUp')
app.use(HRSignup) 

const VerifyProfile=require('./Components/Admin/VerifyProfile')
app.use(VerifyProfile)

const Task=require('./Components/Tasks/Task')
app.use(Task)


const MyJobs=require('./Components/Students/MyJobs')
app.use(MyJobs)


const AdminDataBase=require('./Components/Admin/DataBaseAdmin')
app.use(AdminDataBase)


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


module.exports=app