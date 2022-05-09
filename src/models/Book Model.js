// const mongoose=require('mongoose')
// const ObjectId = mongoose.Schema.Types.ObjectId
// const Bookschema = new mongoose.Schema({
//     {
//         title: {type:String,required:true, unique:true},
//         excerpt: {type:String, required:true}, 
//         userId: {type:ObjectId, required:true, ref:"User"},
//         ISBN: {string, mandatory, unique},
//         category: {string, mandatory},
//         subcategory: [string, mandatory],
//         reviews: {number, default: 0, comment: Holds number of reviews of this book},
//         deletedAt: {Date, when the document is deleted}, 
//         isDeleted: {boolean, default: false},
//         releasedAt: {Date, mandatory, format("YYYY-MM-DD")}
// })