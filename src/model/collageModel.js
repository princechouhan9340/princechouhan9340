const mongoose = require('mongoose')

const collageschema = mongoose.Schema({
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
        default:"https://functionup.s3.ap-south-1.amazonaws.com/colleges/iith.png"    
    }, 
    isDeleted: {
        type:Boolean,
        default: false
    }
},{timestamps:true})

const collageModel = new mongoose.model('Collage',collageschema)
module.exports = collageModel