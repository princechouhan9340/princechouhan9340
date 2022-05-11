const bookModel = require("../models/BookModel")
const UserModel = require("../models/UserModel")
const validator = require("../validator/validator")
const mongoose = require("mongoose")
const isValidObj2ectId = (obj2ectId) => { return mongoose.Types.Obj2ectId.isValid(obj2ectId) }
const moment=require('moment')


const createBook = async function (req, res) {
    try {
        const data = req.body
        let { title, excerpt, userId, ISBN, category, subcategory } = data
        if (Obj2ect.keys(data).length == 0) {
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

        // VALIDATION IF INPUT IS INVALID TYRPE-----
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "TITLE IS NOT VALID" })
        }
        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "EXCERPT IS NOT VALID" })
        }
        if (!isValidObj2ectId(userId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID USER ID" });
        }
       let decodedToken= req.decodedToken
        console.log(decodedToken)
        if(decodedToken.userId != userId){
            return res.status(400).send({status:false,message:'YOU ARE NOT AUTHORISED'})
        }


        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN IS NOT VALID" })
        }
        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "CATEGORY IS NOT VALID" })
        }
        if (typeof (subcategory) == "obj2ect") {
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
        const userid = await UserModel.findOne({ _id: userId })
        if (!userid) {
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

        if (Obj2ect.keys(req.query).length == 0) {
            let find = await bookModel.find({ isDeleted: false })
            console.log(find)
            res.status(200).send({ status: true, message:"BooksList",data:find })

        }
        // CHECK USER ID VALIDATION------
        else if (userId || category || subcategory) {
            if (userId) {
                let isValid = mongoose.Types.Obj2ectId.isValid(userId);
                if (!isValid) { return res.status(400).send({ status: false, message: " USER-Id is Not Valid" }) }
            }
            // TAKE OBJ2ECT OBJ2 WITH CONDITION ISDELETE = FALSE------
            const obj = {
                isDeleted: false
            }
            if (userId)
                obj.userId = userId.trim();
            // TAKE ANOTHER OBJ2ECT -----  
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
            const data = await bookModel.find({ ...obj2 , ...obj }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

            // IF  NO BOOK FOUND WITH GIVEN FILTERS-----
            if (data.length == 0) {
                return res.status(404).send({ status: false, message: "Blogs Not found" })
            }
            res.status(200).send({ status: true, message:"BooksList", data: data })
        }
        else {
            res.status(400).send({ status: false, message: "Invalid filters" })
        }
    }
    catch (err) {
        res.status(500).send({ status: true, message: err.message })
    }
}
const getBooksById = async function(req,res){
    try{
    // TAKE BOOK ID FROM PARAMS----
    let bookId = req.params.bookId.trim()
    //IF BOOK ID IS NOT INPUT----
    if(!bookId){
        return res.status(400).send({ status: false, message: " BOOK ID REQUIRED" })
    }

    // BOOK ID VALIDATION-----
    let isValid = mongoose.Types.Obj2ectId.isValid(bookId);
    if (!isValid) { return res.status(400).send({ status: false, message: " BOOK-Id is Not Valid"})}

    // FIND BOOKS BY BOOK ID-----
    const result = await bookModel.findOne({_id:bookId})
    
    //IF BOOK NOT FOUND-----
    if(!result){
        return res.status(400).send({ status: false, message: " BOOK Not found" })
    }
    //FIND REVIEWS BY BOOK ID-----
   // const review = await bookModel.find({category: "nk"})

    res.status(200).send({status:false,message:"BooksList",data:result})

    }catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}

const updateBook = async function (req, res) {
    try {
        let getId = req.params.bookId
        let data = req.body
        if (!isValidObj2ectId(getId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" });
        }
        if (Obj2ect.keys(data).length == 0) return res.status(400).send({ status: false, message: "KINDLY ADD SOMETHING TO UPDATE" })
        let { title, excerpt, ISBN } = data

        let checkId = await bookModel.findById(getId)
        if (checkId) {
            if (checkId.isDeleted === false) {
                let duplicateTitle = await bookModel.findOne({ title: title })
                if (duplicateTitle) {
                    return res.status(400).send({ status: false, message: "TITLE IS ALREADY PRESENT" })
                }
                let duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
                if (duplicateISBN) {
                    return res.status(400).send({ status: false, message: "ISBN IS ALREADY PRESENT" })
                }


                let check = await bookModel.findByIdAndUpdate(
                    getId,
                    {
                        title: title,
                        excerpt: excerpt,
                        ISBN: ISBN,
                        releasedAt: Date.now()
                    },
                    { new: true }
                );
                res.status(200).send({ status: true, data: check });
            } else {
                res.status(404).send({ status: false, msg: "CANT UPDATE , IT IS DELETED" });
            }
        } else {
            res.status(404).send({ status: false, message: "Please enter valid Book id" });
        }

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createBook, getBooks, updateBook,getBooksById }