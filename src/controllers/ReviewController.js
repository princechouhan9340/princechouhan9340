const { isValidObjectId, default: mongoose, set } = require("mongoose")
const BookModel = require("../models/BookModel")
const ReviewModel = require("../models/ReviewModel")
const UserModel = require("../models/UserModel")


const createReview = async (req,res)=>{
    try{
        let {reviewedBy, rating, review} = req.body
        let bookId = req.params.bookId
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false, message:"'BOOK ID' is Invalid!"})
        }

        const isBookExist = await BookModel.findOne({_id:bookId})
        if(!isBookExist){
            return res.status(404).send({status:false, message:"no book found with given ID"})
        }
        if(isBookExist.isDeleted==true){
            return res.status(404).send({status:false, message:"DELETED BOOKS CANT BE REVIEWED"})
        }

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "No data in request body" })
         
        if(!reviewedBy){
            return res.status(400).send({status:false, message:"'reviewedBy' is empty!"})
        }
        if(!rating){
            return res.status(400).send({status:false, message:"'Rating' is empty/not given"})
        }
        if(rating < 1 || rating > 5){
            return res.status(401).send({status:false, message:"Invalid value of rating, It should be betweeen 1 and 5"})
        }
        let checkuser =await UserModel.findOne({name:reviewedBy})
        if(!checkuser){
            return res.status(404).send({status:false, message:"NO USER FOUND"})
        }
        if(checkuser.isDeleted==true){
            return res.status(400).send({status:false, message:" USER DELETED"})
        }
        
       

        let newReview = {
            bookId:bookId,
            reviewedBy:reviewedBy,
            reviewedAt: Date(),
            rating: rating,
            review: review
        }

        let createdReview = await ReviewModel.create(newReview) 

        let Reviews = await ReviewModel.find({bookId:bookId, isDeleted:false})
        let count = Reviews.length
        console.log(Reviews);
        let updatedBook = await BookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{$set:{reviews:count}},{new:true})
        console.log(updatedBook);
        updatedBook.reviewsData = Reviews
        console.log(updatedBook);
        return res.status(200).send({status:true, message:"Books List!", data:{...updatedBook.toObject() ,reviewsData:Reviews }})

    }catch(err){
        res.status(500).send({status:false, message:err.message})
    }
}




const updateReview = async (req,res)=>{
    try{
        let {reviewedBy, rating, review} = req.body
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "No data in request body" })
        
        if(!mongoose.Types.ObjectId.isValid(reviewId)){
            return res.status(400).send({status:false, message:"Not a valid review Id"})
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)){
            return res.status(400).send({status:false, message:"Not a valid Book Id"})
        }
        if(!reviewedBy){
            return res.status(400).send({status: false, message:"ReviewedBy should be present in request Body"})
        }
        if(!rating){
            return res.status(400).send({status: false, message:"Rating should be present in request Body"})
        }
        if(!review){
            return res.status(400).send({status: false, message:"Review should be present in request Body"})
        }
        
        let isBookExist = await BookModel.findOne({_id:bookId, isDeleted:false})
        if(!isBookExist){
            return res.status(400).send({status:false, message:"no book found with given Book Id / Already Deleted"})
        }
        let isReviewExist =  await ReviewModel.findOne({_id:reviewId, isDeleted:false})
        if(!isReviewExist){
            return res.status(400).send({status:false, message:"no Review found with given Review Id / Already Deleted"})
        }
        if(isReviewExist.bookId != bookId){
            res.status(400).send({status:false, message:`The review with ${reviewId} Id is not the review of Book with ${bookId} Id`})
        }

        let updatedReview = await ReviewModel.findOneAndUpdate({_id:reviewId}, {$set:{reviewedBy:reviewedBy, rating:rating, review:review}},{new:true})

        return res.status(200).send({status:true, message:"updated Succesfully", data:updatedReview})

        

    }catch(err){
        res.status(500).send({status:false, message:err.message})
    }
}



const deleteReview = async (req,res)=>{
    try{
        let reviewId = req.params.reviewId
        let bookId = req.params.bookId

        if(!mongoose.Types.ObjectId.isValid(reviewId)){
            return res.status(400).send({status:false, message:"Not a valid review Id"})
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)){
            return res.status(400).send({status:false, message:"Not a valid Book Id"})
        }

        let review = await ReviewModel.findOne({_id:reviewId, isDeleted:false})

        if(!review){
            return res.status(404).send({status:false, message:"No review Found/ Already Deleted"})
        }

        let book = await BookModel.findOne({_id:bookId, isDeleted:false})

        if(!book){
            return res.status(404).send({status:false, message:"NO book found / Already Deleted"})
        }
        
        if(review.bookId != bookId){
            res.status(400).send({status:false, message:`The review with ${reviewId} Id is not the review of Book with ${bookId} Id`})
        }

        let deletedReview = await ReviewModel.findOneAndUpdate({_id:reviewId, isDeleted:false}, {isDeleted:true, deletedAt:Date()}, {new:true})

        if(deletedReview){
            let updateBook = await BookModel.findOneAndUpdate({_id:bookId}, {$inc:{reviews:-1}})
        }

        return res.status(200).send({status:true, message:" review Deleted !", data:deletedReview })

    }catch(err){
        res.status(500).send({status:false, message:err.message})
    }

}


module.exports = {createReview,updateReview, deleteReview}