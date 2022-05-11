const { isValidObjectId } = require("mongoose")
const BookModel = require("../models/BookModel")
const ReviewModel = require("../models/ReviewModel")


const createReview = async (req,res)=>{
    try{
        let {reviewedBy, rating, review} = req.body
        let bookId = req.params.bookId

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
        if(!review){
            return res.status(400).send({status:false, message:"'review' is empty/not given"})
        }
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false, message:"'BOOK ID' is Invalid!"})
        }

        const isBookExist = await BookModel.findOne({bookId:bookId, isDeleted:false })
        if(!isBookExist){
            return res.status(404).send({status:false, message:"no book found with given ID/ is Already Deleted"})
        }

        let newReview = {
            bookId:bookId,
            reviewedBy:reviewedBy,
            reviewedAt: Date(),
            rating: rating,
            review: review
        }

        let createdReview = await ReviewModel.create(newReview) 

        if(!createdReview){
            return res.status(400).send({status:false, message:"no Review Doc is created!"})
        }

        let Reviews = await ReviewModel.find({bookId:bookId, isDeleted:false})
        let count = Reviews.length
        console.log(Reviews);
        let updatedBook = await BookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{$set:{reviews:count}},{new:true})
        console.log(updatedBook);
        // let responseObj = {

        //     title:updatedBook.title,
        //     excerpt:updatedBook.excerpt,
        //     userId:updatedBook.userId,
        //     category:updatedBook.category,
        //     subcategory:updatedBook.subcategory,
        //     isDeleted:updatedBook.isDeleted,
        //     reviews:updatedBook.reviews,
        //     detetedAt:updatedBook.detetedAt,
        //     releasedAt:updatedBook.releasedAt,
        //     createdAt:updatedBook.createdAt,
        //     updatedAt:updatedBook.updatedAt,
        //     reviewsData:Reviews
        // }
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

        

    }catch(err){
        res.status(500).send({status:false, message:err.message})
    }
}


module.exports = {createReview}