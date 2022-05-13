const { isValidObjectId, default: mongoose, set } = require("mongoose")
const BookModel = require("../models/BookModel")
const ReviewModel = require("../models/ReviewModel")


const createReview = async (req, res) => {
    try {
        let { reviewedBy, rating, review } = req.body
        let bookId = req.params.bookId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }

        const isBookExist = await BookModel.findOne({ _id: bookId })
        if (!isBookExist) {
            return res.status(404).send({ status: false, message: "NO BOOK FOUND" })
        }
        if (isBookExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "DELETED BOOKS CANT BE REVIEWED" })
        }

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "NO DATA IN REQUEST BODY" })


        if (!rating) {
            return res.status(400).send({ status: false, message: "RATING CANT BE EMPTY" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(401).send({ status: false, message: "INVALID VALUE , RATING SHOULD LIE BETWEEN 1 AND 5" })
        }

        let newReview = {
            bookId: bookId,
            reviewedBy: reviewedBy,
            reviewedAt: Date(),
            rating: rating,
            review: review
        }

        let createdReview = await ReviewModel.create(newReview)

        let Reviews = await ReviewModel.find({ bookId: bookId, isDeleted: false })
        let count = Reviews.length

        let updatedBook = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: { reviews: count } }, { new: true })

        return res.status(200).send({ status: true, message: "Books List!", data: { ...updatedBook.toObject(), reviewsData: createdReview } })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}




const updateReview = async (req, res) => {
    try {
        let { reviewedBy, rating, review } = req.body
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID , BOOKS" })
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID , REVIEWS" })
        }

        let isBookExist = await BookModel.findOne({ _id: bookId})

        if (!isBookExist) {
            return res.status(404).send({ status: false, message: "NO BOOK FOUND " })
        }
        if (isBookExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "THIS BOOK IS DELETED" })
        }
        let isReviewExist = await ReviewModel.findOne({ _id: reviewId})
        if (!isReviewExist) {
            return res.status(404).send({ status: false, message: "NO REVIEW FOUND" })
        }
        if (isReviewExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "THIS REVIEW IS DELETED" })
        }

        if (isReviewExist.bookId != bookId) {
            return res.status(400).send({ status: false, message: `THE REVIEW WITH ${reviewId} ID IS NOT THE REVIEW OF BOOK WITH ${bookId} ID` })
        }

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "NO DATA IN REQ BODY" })

        else if (reviewedBy || rating || review) {



            let updatedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { reviewedBy: reviewedBy, rating: rating, review: review } }, { new: true })


            let Reviews = await ReviewModel.find({ bookId: bookId, isDeleted: false })
            let count = Reviews.length

            let updatedBook = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: { reviews: count } }, { new: true })
            return res.status(200).send({ status: true, message: "UPDATES SUCCESSFULLY", data: { ...updatedBook.toObject(), reviewsData: updatedReview } })
        }
        else {
            res.status(400).send({ status: false, message: "CANT UPDATE THESE DETAILS" })
        }
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



const deleteReview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID,BOOKS" })
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }

        let review = await ReviewModel.findOne({ _id: reviewId })

        if (!review) {
            return res.status(404).send({ status: false, message: "NO REVIEW FOUND" })
        }
        if (review.isDeleted == true) {
            return res.status(404).send({ status: false, message: "REVIEW ALREADY DELETED" })
        }

        let book = await BookModel.findOne({ _id: bookId})

        if (!book) {
            return res.status(404).send({ status: false, message: "NO BOOK FOUND " })
        }
        if (book.isDeleted == true) {
            return res.status(404).send({ status: false, message: "THE BOOK IS DELETED" })
        }

        if (review.bookId != bookId) {
            res.status(400).send({ status: false, message: `THE REVIEW WITH ${reviewId} ID IS NOT THE REVIEW OF BOOK WITH ${bookId} ID` })
        }

        let deletedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { isDeleted: true, deletedAt: Date() })

        if (deletedReview) {
            let updateBook = await BookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }

        return res.status(200).send({ status: true, message: "REVIEW SUCCESSFULLY DELETED", data: `ID ${reviewId}` })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { createReview, updateReview, deleteReview }