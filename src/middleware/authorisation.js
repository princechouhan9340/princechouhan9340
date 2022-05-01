const jwt = require("jsonwebtoken")
const blogsModel = require("../model/blogModel")
var mongoose = require('mongoose');

const authorisation = async function (req, res,next) {
   try{ 
    const tokenId = req.tokenId
   // console.log(tokenId)
    const blogId = req.params.blogId;
    let isValid = mongoose.Types.ObjectId.isValid(blogId);
    console.log(isValid,blogId)
    if (!isValid) { return res.status(400).send({ status: false, msg: "Blog Id is Not Valid" }) }
    
    let author = await blogsModel.findOne({ _id: blogId }).select({ authorId: 1 }) // {_id , authorId}
    let authorId = author.authorId;
    if (authorId != tokenId) {
        return res.status(403).send({ status: false, msg: "Unauthorised access" })
    }
    next()}
    catch (err) {
        res.status(500).send({ msg: err.message })
    }
}
module.exports.authorisation = authorisation