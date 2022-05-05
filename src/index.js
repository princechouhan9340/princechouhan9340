const express = require("express")
const bodyparser = require('body-parser')
const mongoose = require("mongoose")
const route = require('../src/routes/route') 
const validator = require("email-validator")
const app = express();

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

mongoose.connect('mongodb+srv://prince_chouhan9340:VmEz2U6wR9QeMWxw@cluster0.7obeg.mongodb.net/functionUp_project2-db?retryWrites=true&w=majority',{
    useNewurlParser:true
}).then(()=>{
    console.log("MongoDb is conected")
}).catch(err=>console.log(err))

app.use("/", route)
// www.domianName.com/

app.listen(3000)