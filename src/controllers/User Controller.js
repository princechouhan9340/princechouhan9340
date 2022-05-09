const userModel = require('../models/User Model')
const validator = require('../validator/validator')
const jwt = require("jsonwebtoken")

const createUser = async function (req, res) {
    try {
        let data = req.body
        let passwordregex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/

        let { title, name, phone, email, password, address } = data
        if (!title) {
            return res.status(400).send({ status: false, message: "TITLE CANT BE EMPTY" })
        }
        if (!validator.isTitleValid(title)) {
            return res.status(400).send({ status: false, message: "TITLE IS NOT VALID" })
        }
        if (!name) {
            return res.status(400).send({ status: false, message: "NAME CANT BE EMPTY" })
        }
        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, message: "NAME IS NOT VALID" })
        }
        if (!phone) {
            return res.status(400).send({ status: false, message: "NUMBER CANT BE EMPTY" })
        }
        if (!validator.isPhoneValid(phone)) {
            return res.status(400).send({ status: false, message: "PHONE NUMBER IS NOT VALID" })
        }
        if(!password){
            return res.status(400).send({ status: false, message: "PASSWORD CAN NOT BE EMPTY" })
        }
        if(!password.match(passwordregex)){
            return res.status(400).send({
                message: "Password should include atleast one special character, one uppercase, one lowercase, one number and should be mimimum 8 character long",
              });
        
        }
        if(!email){
            return res.status(400).send({ status: false, message: "Email can not be empty" })
        }
        if(!validator.isEmailValid(email)){
            return res.status(400).send({ status: false, message: "Email IS NOT VALID" })
        }
        if(!address){
            return res.status(400).send({ status: false, message: "Address can not be empty" })
        }
        let saved = await userModel.create(data)
        res.status(201).send({ status: true, message: "Success", data: saved })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const loginUser = async function (req,res){
try{
    let {email, password} = req.body

    if(!email){
        return res.status(400).send({ status: false, message: "Email can not be empty" })
    }
    if(!password){
        return res.status(400).send({ status: false, message: "PASSWORD CAN NOT BE EMPTY" })
    }

    const user  = await userModel.findOne({email:email})
    if(!user){
        return res.status(400).send({ status: false, message: "User not found" })
    }
    if(user.password!=password){
        return res.status(400).send({ status: false, message: "Password is incorrect" })
    }
    const token = jwt.sign({userId : user._id.toString()}, "This is project 3", {expiresIn:"2h"})

    res.setHeader("x-api-key", token);

    res.status(200).send({status:true, message:"you are Logged in!", token:token})

}catch(err){
    res.status(500).send({ status: false, message: err.message })
}
}

module.exports = { createUser,loginUser }