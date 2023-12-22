const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')
const db = require('../DataBase/DataBase');
const { sendEmail, sendEmailWithDomain } = require('../Notifiers/EmailNotifier');

const DB = require('../SQLDataBase/SQLDatabase')
DB.connect()
const router = express.Router()

const DB2=require('../SQLDataBase/DataBase2')

const Testing=async ()=>
{
    let query=`select * from Students`
    let result1=await DB.runQuery(query)
    let result2=await DB.runQuery(query)
    result1=result1.result;
    result2=result2.result
    console.log(result1.length,result2.length)
}
router.get('/admin/database/test',async (req,resp)=>
{
    await Testing()
    resp.send(true)
})

module.exports = router