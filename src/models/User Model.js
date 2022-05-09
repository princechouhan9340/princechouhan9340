const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
   
        { 
          title: {type:String, required:true, enum:[Mr, Mrs, Miss]},
          name: {String, required:true},
          phone: {String,required:true, unique:true},
          email: {String, required:true, unique:true}, 
          password: {String, required:true, minLength: 8, maxLength: 15},
          address: {
            street: {String},
            city: {String},
            pincode: {String}
          },
          },{timestamps:true})