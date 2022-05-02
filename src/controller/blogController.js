const mongoose = require('mongoose');
const blogsModel = require("../model/blogModel")
const authorModel = require("../model/authorModel")



const createBlogs = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: true, msg: "input empty" })
        }
        if (data.title == undefined || data.body == undefined || data.authorId == undefined || data.category == undefined) {
            return res.status(400).send({ status: false, msg: "Enter Mandentory Feilds" })
        }
        // if (typeof (data.title) != "string" || typeof (data.body) != "string" || (!Array.isArray(data.tags) && typeof(data.tags)!="undefined") || (!Array.isArray(data.subcategory) && typeof(data.subcategory)!="undefined") || !Array.isArray(data.category) || (typeof(data.isPublished)!="boolean" && typeof(data.isPublished)!="undefined") ) {
        //     return res.status(400).send({ status: false, msg: "invalid input" })
        // }

        if (typeof (data.title) != "string" || typeof (data.body) != "string" || (!Array.isArray(data.tags) && typeof(data.tags)!="undefined") || (!Array.isArray(data.subcategory) && typeof(data.subcategory)!="undefined") || typeof(data.category)!="string" || (typeof(data.isPublished)!="boolean" && typeof(data.isPublished)!="undefined") ) {
            return res.status(400).send({ status: false, msg: "invalid input" })
        }
        // removing extra spaces from every array's input
        for (let key in data) {
            if (Array.isArray(data[key])) {
                let arr=[];
                for (let i = 0; i < data[key].length; i++) {
                        if(data[key][i].trim().length>0)
                    arr.push(data[key][i].toLowerCase().trim())
                }
                data[key] = [...arr];
            }
        }
            if (data.isPublished == true) {
                data.publishedAt = new Date();
            }
        data.authorId = data.authorId.trim()
        let isValid = mongoose.Types.ObjectId.isValid(data.authorId);
        if (!isValid) { return res.status(400).send({ status: false, msg: "Author Id is Not Valid " }) }
       
        const get_data = await authorModel.findOne({ _id: data.authorId })
        
        if (!get_data) {
            return res.status(400).send({ status: false, msg: "Author not found.." })
        }

        const result = await blogsModel.create(data)
        res.status(200).send({ staus: true, msg: result })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const getBlogs = async function (req, res) {
    try {
        const { authorId, category, tags, subcategory } = req.query
        if (authorId) {
            let isValid = mongoose.Types.ObjectId.isValid(authorId);
            if (!isValid) { return res.status(400).send({ status: false, msg: "Author Id is Not Valid" }) }
        }
             //   find({title:input_title})
        const obj = {
            isDeleted: false,
            isPublished: true
        }
        if (authorId)
            obj.authorId = authorId.trim();
       
            const obj2 = {}
        // if (category) {
        //     obj2.category = category
        // }

        if (category) {
            obj.category = category
        }
        if (tags) {
            obj2.tags = tags
        }
        if (subcategory)
            obj2.subcategory = subcategory
                // find ({title: input_title })   //  tags: {$all: ['book','coding']}
        for (let key in obj2) {
            if (typeof (obj2[key]) == "string") {
                obj2[key] = obj2[key].split(",") // "book ,coding" => {tags: ['book','coding']}
            }
            for (let i = 0; i < obj2[key].length; i++)
                obj2[key][i] = obj2[key][i].toLowerCase().trim()
            obj2[key] = { $all: obj2[key] }
        }
        const data = await blogsModel.find({ ...obj, ...obj2 })
        if (data.length == 0) {
            return res.status(404).send({ status: false, msg: "Blogs Not found" })
        }
        res.status(200).send({ status: true, data: data })
    }
    catch (err) {
        res.status(500).send({ status: true, msg: err.message })
    }
}


const updateBlogs = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) { return res.send({ status: false, msg: "Provide some data" }) }

        let { title, body, isPublished, tags, subcategory } = req.body;
        if ((typeof (title) != "string" && typeof (title) != "undefined") || (typeof (body) != "string" && typeof (body) != "undefined") || (typeof (isPublished) != "boolean" && typeof (isPublished) != "undefined") || (!Array.isArray(tags) && typeof (tags) != "undefined") || (!Array.isArray(subcategory) && typeof (subcategory) != "undefined")) {
            return res.status(400).send({ status: false, msg: "invalid input" })
        }
        // pushing only those values which are coming from request body
        let obj = {}
        if (title)
            obj.title = title.trim().toLowerCase();
        if (body)
            obj.body = body.trim().toLowerCase();
        if (isPublished == true) {
            obj.isPublished = true;
            obj.publishedAt = new Date();
        }
        const result = await blogsModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false }, { $set: obj }, { new: true })
        if (!result) { return res.status(404).send({ status: false, msg: "Blog not found" }) }
        if (tags) {
            //removing extra spaces and empty elements from array
            let arr=[]
                    for (let i = 0; i < tags.length; i++) {
                            if(tags[i].trim().length>0)
                        arr.push(tags[i].toLowerCase().trim())
                    }            
            result.tags = result.tags.concat(arr)
        }
        if (subcategory) {
            let arr=[]
            for (let i = 0; i < subcategory.length; i++) {
                    if(subcategory[i].trim().length>0)
                arr.push(subcategory[i].toLowerCase().trim())
            }    
            result.subcategory = result.subcategory.concat(arr)
        }
        result.save()
        res.status(201).send({ status: true,data: result })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId.trim();
        let date = new Date()
        const result = await blogsModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, { isDeleted: true, deletedAt: date })
        if (!result)
            return res.status(404).send({ status: false, msg: "blog not found" })
        console.log(result, "deleted")
        res.status(200).send("")
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const deleteBlogs = async (req, res) => {
    try {

        let keyArr = Object.keys(req.query)
        let somethingBad = false;
        console.log(req.query)
        // checking any unwanted key coming or not
        for (let i = 0; i < keyArr.length; i++) {
            if (!(keyArr[i] == "category" || keyArr[i] == "tags" || keyArr[i] == "subcategory" || keyArr[i] == "isPublished" || keyArr[i] == "authorId"))
                somethingBad = true;
        }
        // if we got any unwanted key or empty body
        if (somethingBad || keyArr.length == 0) {
            return res.status(400).send({ status: false, msg: "invalid input" })
        }
        //extracting keys from req.query
        let { category, tags, subcategory, isPublished, authorId } = req.query
        // if we're getting authorId in request but not matching with tokenId

      //  if (typeof(authorId)!="undefined" && authorId != req.tokenId)
      if (authorId && authorId != req.tokenId)
            return res.status(403).send({ status: false, msg: "Unauthorised access" })

        let obj = {
            authorId : req.tokenId,
            isDeleted:false
        }
        if(typeof(isPublished)!="undefined" && isPublished===false)
            obj.isPublished=isPublished;
        let obj2 = {}
        // if (category) {
        //     obj2.category = category
        // }
        if (category) {
            obj.category = category
        }
        if (tags) {
            obj2.tags = tags
        }
        if (subcategory)
            obj2.subcategory = subcategory
                // making query oriented object for arrays because array  comparision done like {array_name :{$all : input_array}}
        for (let key in obj2) {
            if (typeof (obj2[key]) == "string") {
                obj2[key] = obj2[key].split(",")
            }
            for (let i = 0; i < obj2[key].length; i++)
                obj2[key][i] = obj2[key][i].toLowerCase().trim()
            obj2[key] = { $all: obj2[key] }
        }
        let date = new Date()
        // blogModel.find({email:"sunil@gmail.com",authorId:"123"}) // authorId 456
        const data = await blogsModel.updateMany({ ...obj, ...obj2 }, { $set: { isDeleted: true, deletedAt: date } })
        if (data.matchedCount == 0)
            return res.status(404).send({ status: false, msg: "blog not found" })
        res.status(200).send({ status: true, data: "finally deleted Successfull " + data.matchedCount + " documents" })
    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }
}


module.exports.getBlogs = getBlogs;
module.exports.createBlogs = createBlogs;
module.exports.updateBlogs = updateBlogs;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteBlogs = deleteBlogs;



