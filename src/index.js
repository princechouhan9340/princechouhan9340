const express = require('express');
const bodyParser = require('body-parser');
const multer = require("multer")
const { AppConfig } = require('aws-sdk');
const route = require('./routes/route');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())

mongoose.connect('mongodb+srv://Kaustubh-db:Bs9axX3hjg0bR120@cluster0.su9ki.mongodb.net/Group33Database', 
{
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err =>  console.log(err) )



app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
//namste javascript