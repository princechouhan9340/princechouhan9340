const userModel = require('../models/User Model')
const validator = require('../validator/validator')

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
        if(!password.match(passwordregex)){
            return res.status(400).send({
                message: "Password should include atleast one special character, one uppercase, one lowercase, one number and should be mimimum 8 character long",
              });
        
        }
        let saved = await userModel.create(data)
        res.status(201).send({ status: true, message: "Success", data: saved })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser }