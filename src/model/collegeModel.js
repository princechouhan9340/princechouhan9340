const mongoose = require('mongoose')

const collegeschema = new mongoose.Schema({
    name: { 
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
    }, 
    fullName: {
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    logoLink: {
        type:String,
        required:true,
        trim:true   
    }, 
    isDeleted: {
        type:Boolean,
        default: false
    }
},{timestamps:true})

const collegeModel = new mongoose.model('Collage',collegeschema)
module.exports = collegeModel