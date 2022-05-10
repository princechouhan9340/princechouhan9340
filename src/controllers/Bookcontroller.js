const bookModel = require("../models/BookModel")
const UserModel = require("../models/UserModel")
const validator = require("../validator/validator")
const mongoose = require("mongoose")

const createBook = async function (req, res) {
    try {
        const data = req.body
        let { title, excerpt, userId, ISBN, category, subcategory } = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "EMPTY INPUT" })
        }
        const isValidObjectId = (objectId) => { return mongoose.Types.ObjectId.isValid(objectId)}

        // ALL VALIDATION IF REQUEST IS EMPTY----
        if (!title) {
            return res.status(400).send({ status: false, message: "TITLE IS REQUIRED" })
        }
        if (!excerpt) {
            return res.status(400).send({ status: false, message: "EXCERPT IS REQUIRED" })
        }
        if (!userId) {
            return res.status(400).send({ status: false, message: "USER-ID IS REQUIRED" })
        }
        if (!ISBN) {
            return res.status(400).send({ status: false, message: "ISBN IS REQUIRED" })
        }
        if (!category) {
            return res.status(400).send({ status: false, message: "CATEGORY IS REQUIRED" })
        }
        if (!subcategory) {
            return res.status(400).send({ status: false, message: "SUBCATEGORY IS REQUIRED" })
        }

        // VALIDATION IF INPUT IS INVALID TYRPE-----
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "TITLE IS NOT VALID" })
        }
        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "EXCERPT IS NOT VALID" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:"NOT A VALID USER ID"});
          }
      
        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN IS NOT VALID" })
        }
        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "CATEGORY IS NOT VALID" })
        }
        if (typeof (subcategory) == "object") {
            for (let i = 0; i < subcategory.length; i++) {
                if (!validator.isValid(subcategory[i]))
                    return res.status(400).send({ status: false, message: "SUB-CATEGORY IS NOT VALID" })
            }
            if (subcategory.length == 0)
                return res.status(400).send({ status: false, message: "SUB-CATEGORY IS NOT VALID" })

        }
        if (!validator.isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "SUB-CATEGORY IS NOT VALID" })
        }
        //CHECK UNIQUENESS------

        const isValidTitle = await bookModel.findOne({ title: title })
        if (isValidTitle) {
            return res.status(400).send({ status: false, message: "TITLE ALREADY EXISTS" })
        }

        const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (isUniqueISBN) {
            return res.status(400).send({ status: false, message: "ISBN ALREADY EXISTS" })
        }
        // CHECK USER-ID IS PRESENT OR NOT IN USER COLLECTION
        const userid = await UserModel.findOne({_id:userId})
        if(!userid){
            return res.status(404).send({ status: false, message: "USER NOT FOUND" })
        }
        const result = await bookModel.create(data)
        res.status(201).send({ status: true, message: "Success", data: result })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const getBooks = async function (req, res) {
    try {
        const { userId, category, subcategory } = req.query
        // CHECK USER ID VALIDATION------
        if (userId) {
            let isValid = mongoose.Types.ObjectId.isValid(userId);
            if (!isValid) { return res.status(400).send({ status: false, message: " USER-Id is Not Valid" }) }
        }
        // TAKE OBJECT OBJ WITH CONDITION ISDELETE = FALSE------
        const obj = {
            
        }
        if (userId)
            obj.userId = userId.trim();
        // TAKE ANOTHER OBJECT -----  
        //const obj = {}
        if (category) {
            obj.category = category
        }
        if (subcategory)
            obj.subcategory = subcategory
        // MAKE A FOR LOOP FOR SPLITING AND TRIMING GIVEN FILTERS------
        for (let key in obj) {
            if (typeof (obj[key]) == "string") {
                obj[key] = obj[key].split(",")
            }
            for (let i = 0; i < obj[key].length; i++)
                obj[key][i] = obj[key][i].toLowerCase().trim()
            obj[key] = { $all: obj[key] }
        }
        //FIND BOOK WITH THE HELP OF GIVEN FILTERS------
        const data = await bookModel.find({ ...obj }).select({_id:1, title:1, excerpt:1, userId:1, category:1, releasedAt:1, reviews:1})

        // IF  NO BOOK FOUND WITH GIVEN FILTERS-----
        if (data.length == 0) {
            return res.status(404).send({ status: false, message: "Blogs Not found" })
        }
        res.status(200).send({ status: true, data: data })
    }
    catch (err) {
        res.status(500).send({ status: true, message: err.message })
    }
}

module.exports = { createBook , getBooks }