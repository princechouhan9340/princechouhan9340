const aws = require("aws-sdk")
const bookModel = require("../models/BookModel")
const UserModel = require("../models/UserModel")
const reviewModel = require('../models/ReviewModel')
const validator = require("../validator/validator")
const mongoose = require("mongoose")
const isValidObjectId = (objectId) => { return mongoose.Types.ObjectId.isValid(objectId) }
const moment = require('moment')
const ReviewModel = require("../models/ReviewModel")
let dateregex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})
// UPLOAD FILE IN AWS S3---
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        let uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "bookcover/" + file.originalname, //HERE 
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}

const createBook = async function (req, res) {
    try {
        // FETCH DATA FROM RE.BODY----
        const data = req.body

        // FETCH FILE FROM REQ.----
        // VALIDATION FOR UPLODED BOOKCOVER FILE----

        let files = req.files
        if (!files) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            res.status(400).send({ msg: "No file found" })

            //res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        let uploadedCover = await uploadFile(files[0])

        // DESTRUCTURING DATA-----
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        //CHECK DATANPRESENT OR NOT IN REQ.BODY-----
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "EMPTY INPUT" })
        }

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
        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "RELEASED DATE IS REQUIRED" })
        }
        // VALIDATION IF INPUT IS INVALID TYRPE-----
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "TITLE IS NOT VALID" })
        }
        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "EXCERPT IS NOT VALID" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID USER ID" });
        }

        //GIVE AUTHORIZATION TO USER TO CREATE BOOK----
        let decodedToken = req.decodedToken

        if (decodedToken.userId != userId) {
            return res.status(403).send({ status: false, message: 'YOU ARE NOT AUTHORISED' })
        }
        if (!releasedAt.match(dateregex)) {
            return res.status(400).send({ status: false, message: "INVALID DATE OR KINDLY ADD DATE IN YYYY-MM-DD FORMAT" })
        }

        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN IS NOT VALID" })
        }
        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "CATEGORY IS NOT VALID" })
        }
        // IF SUB CATEGORY IS IN ARRAY -----
        if (typeof (subcategory) == "string") {
            subcategory = subcategory.split(",").map((x) => x.trim())
            console.log(subcategory)
            for (let i = 0; i < subcategory.length; i++) {
                if (!validator.isValid(subcategory[i]))
                    return res.status(400).send({ status: false, message: "SUB-CATEGORY IS NOT VALID" })
            }
            if (subcategory.length == 0)
                return res.status(400).send({ status: false, message: "SUB-CATEGORY IS NOT VALID" })

        }
        // if (!validator.isValid(subcategory)) {
        //     return res.status(400).send({ status: false, message: "SUB-CATEGORY IS NOT VALID" })
        // }
        //CHECK UNIQUENESS------

        const isValidTitle = await bookModel.findOne({ title: title })
        if (isValidTitle) {
            return res.status(400).send({ status: false, message: "TITLE ALREADY EXISTS" })
        }

        const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (isUniqueISBN) {
            return res.status(400).send({ status: false, message: "ISBN ALREADY EXISTS" })
        }
        // CHECK USER-ID IS PRESENT OR NOT IN USER COLLECTION-----
        const userid = await UserModel.findOne({ _id: userId })
        if (!userid) {
            return res.status(404).send({ status: false, message: "USER NOT FOUND" })
        }
        // FETCH AWS S3 CREATED LINK FOR BOOK COVER----


        // CREATE OBJECT TO INCLUED AWS FILE LINK IN REQ.BODY---
        const newData = {
            title: title,
            excerpt: excerpt,
            userId: userId,
            ISBN: ISBN,
            category: category,
            subcategory: subcategory,
            releasedAt: releasedAt,
            bookcover: uploadedCover
        }

        const result = await bookModel.create(newData)
        let result1 = await bookModel.findOne({ title: title }).select({ title: 1, excerpt: 1, userId: 1, ISBN: 1, category: 1, subcategory: 1, releasedAt: 1, bookcover: 1 })
        res.status(201).send({ status: true, message: "Success", data: result1 })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const getBooks = async function (req, res) {
    try {
        const { userId, category, subcategory } = req.query
        // CHECK DATA PRESENT OR NOT IN REQ.BODY----
        if (Object.keys(req.query).length == 0) {
            let find = await bookModel.find({ isDeleted: false }).sort({ title: 1 })
            res.status(200).send({ status: true, message: "BooksList", data: find })

        }
        // CHECK USER ID VALIDATION------
        else if (userId || category || subcategory) {
            if (userId) {
                let isValid = mongoose.Types.ObjectId.isValid(userId);
                if (!isValid) { return res.status(400).send({ status: false, message: " USER-Id is Not Valid" }) }
            }
            // TAKE OBJECT OBJ WITH CONDITION ISDELETE = FALSE------
            const obj = {
                isDeleted: false
            }
            if (userId)
                obj.userId = userId.trim();
            // TAKE ANOTHER OBJECT -----  
            const obj2 = {}
            if (category) {
                obj2.category = category
            }
            if (subcategory)
                obj2.subcategory = subcategory
            // MAKE A FOR LOOP FOR SPLITING AND TRIMING GIVEN FILTERS------
            for (let key in obj2) {
                if (typeof (obj2[key]) == "string") {
                    obj2[key] = obj2[key].split(",")

                }
                for (let i = 0; i < obj2[key].length; i++)
                    obj2[key][i] = obj2[key][i].toLowerCase().trim()
                obj2[key] = { $all: obj2[key] }
            }
            //FIND BOOK WITH THE HELP OF GIVEN FILTERS------
            const data = await bookModel.find({ ...obj2, ...obj }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

            // IF  NO BOOK FOUND WITH GIVEN FILTERS-----
            if (data.length == 0) {
                return res.status(404).send({ status: false, message: "Books Not found" })
            }
            res.status(200).send({ status: true, message: "BooksList", data: data })
        }
        else {
            res.status(400).send({ status: false, message: "Invalid filters" })
        }
    }
    catch (err) {
        res.status(500).send({ status: true, message: err.message })
    }
}
const getBooksById = async function (req, res) {
    try {
        // FETCH BOOK ID FROM PARAMS----
        let bookId = req.params.bookId.trim()

        //IF BOOK ID IS NOT INPUT----
        if (!bookId) {
            return res.status(400).send({ status: false, message: " BOOK ID REQUIRED" })
        }

        // BOOK ID VALIDATION-----
        let isValid = mongoose.Types.ObjectId.isValid(bookId);
        if (!isValid) {
            return res.status(400).send({ status: false, message: "Id is Not Valid" })
        }

        // FIND BOOKS BY BOOK ID-----
        const result = await bookModel.findOne({ _id: bookId, isDeleted: false })

        //IF BOOK NOT FOUND-----
        if (!result) {
            return res.status(404).send({ status: false, message: " BOOK Not found" })
        }
        //FIND REVIEWS BY BOOK ID-----
        let getreview = await reviewModel.find({ bookId: bookId })

        res.status(200).send({ status: false, message: "BooksList", data: { ...result.toObject(), reviewsData: getreview } })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const updateBook = async function (req, res) {
    try {
        //FETCH BOOK ID FROM PARAMS----
        let getId = req.params.bookId
        let data = req.body

        // VALIDATION OF BOOK ID----
        if (!isValidObjectId(getId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" });
        }
        // IF TRY TO UPDATE WITH EMPTY DATA-----
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "KINDLY ADD SOMETHING TO UPDATE" })
        let { title, excerpt, ISBN, releasedAt } = data

        // FIND BOOK BY BOOK ID----
        let checkId = await bookModel.findById(getId)
        if (checkId) {
            if (checkId.isDeleted === false) {

                //CHECK NEW TITLE IS ALRADY PRESENT OR NOT IN DB----
                let duplicateTitle = await bookModel.findOne({ title: title })
                if (duplicateTitle) {
                    return res.status(400).send({ status: false, message: "TITLE IS ALREADY PRESENT" })
                }

                //CHECK NEW ISBN IS ALRADY PRESENT OR NOT IN DB----
                let duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
                if (duplicateISBN) {
                    return res.status(400).send({ status: false, message: "ISBN IS ALREADY PRESENT" })
                }
                // VALIDATION FOR DATE----
                if (releasedAt) {
                    if (!releasedAt.match(dateregex)) {
                        return res.status(400).send({ status: false, message: "INVALID DATE OR KINDLY ADD DATE IN YYYY-MM-DD FORMAT" })
                    }
                }

                // UPDATE GIVEN DATA PRESENT IN BODY-----
                if (title || excerpt || ISBN || releasedAt) {
                    let check = await bookModel.findByIdAndUpdate(
                        getId,
                        {
                            title: title,
                            excerpt: excerpt,
                            ISBN: ISBN,
                            releasedAt: releasedAt
                        },
                        { new: true }
                    );
                    // UPDATE SUCCESSFULL----
                    res.status(200).send({ status: true, message: "Success", data: check });
                }
                else
                    res.status(400).send({ status: false, message: "CANT UPDATE THESE DETAILS" })
            } else {
                res.status(404).send({ status: false, msg: "CANT UPDATE , NOT FOUND" });
            }
        } else {
            res.status(404).send({ status: false, message: "NO BOOK FOUND" });
        }

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
const deleteBook = async function (req, res) {
    try {
        //FETCH BOOK ID PRESENT IN PARAMS----
        let bookId = req.params.bookId

        // VALIDATE BOOK ID ----
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }
        // FIND BOOK BY BOOK ID----
        let book = await bookModel.findById(bookId)

        if (!book) {
            return res.status(404).send({ status: false, message: "BOOK DOES NOT FOUND" })
        }

        // ANOTHER CONDTION FOR FINDING BOOK----
        if (book.isDeleted == true) {
            return res.status(404).send({ status: false, message: "BOOK ALREADY DELETED" })
        }

        // DELETE BOOK SUCCESSFULLY-----
        let updateBook = await bookModel.findByIdAndUpdate(bookId, { isDeleted: true, deletedAt: Date.now() }, { new: true })

        res.status(200).send({ status: true, message: "Success", data: updateBook })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
//MAKE MODULE PUBLIC AND EXPORT FROM HERE----
module.exports = { createBook, getBooks, updateBook, getBooksById, deleteBook }