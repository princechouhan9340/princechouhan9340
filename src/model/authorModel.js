const mongoose = require('mongoose')


const authorSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true,
        lowercase:true,
        trim:true  
    }, lname: {
        type: String,
        required: true,
        lowercase:true,
        trim:true
    }, title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"],
        trim:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true
    },
    password: {
        type: String,
        required: true
    }


}, { timestamps: true })


const  authorModel = new mongoose.model("Author",authorSchema) //authors

module.exports = authorModel;