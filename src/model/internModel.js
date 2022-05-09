const mongoose = require('mongoose')

const internschema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        lowercase:true,
        trim:true
     },
    email: { 
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
    },
    mobile: { 
        type:String,
        required:true,
        unique:true,
        trim:true 
    },
    collegeId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Collage",
        required:true,
        trim:true
    },
    isDeleted: { 
        type:Boolean, 
        default: false 
    }
    },{timestamps:true})

    const internModel = new mongoose.model("Intern",internschema)

    module.exports = internModel