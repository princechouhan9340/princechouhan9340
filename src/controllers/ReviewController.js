const { isValidObjectId, default: mongoose, set } = require("mongoose")
const BookModel = require("../models/BookModel")
const ReviewModel = require("../models/ReviewModel")


const createReview = async (req, res) => {
    try {
        // FETCH DATA FROM BODY AND DESTRUCTURING IT-----
        let { reviewedBy, rating, review } = req.body

        // FETCH BOOK ID FROM THE PARAMS-----
        let bookId = req.params.bookId

        // VALIDATION FOR  OBJECT ID-----
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }

        // FIND BOOK DOCUMENT BY BOOK ID-----
        const isBookExist = await BookModel.findOne({ _id: bookId })
        if (!isBookExist) {
            return res.status(404).send({ status: false, message: "NO BOOK FOUND" })
        }

        // ANOTHER CONDITION FOR FIND BOOK DOCUMENT----- 
        if (isBookExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "DELETED BOOKS CANT BE REVIEWED" })
        }

        // CHECK REQUEST BODY IS EMPTY OR NOT------
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "NO DATA IN REQUEST BODY" })

        // CHECK MANDATROY FIELD----
        if (!rating) {
            return res.status(400).send({ status: false, message: "RATING CANT BE EMPTY" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(401).send({ status: false, message: "INVALID VALUE , RATING SHOULD LIE BETWEEN 1 AND 5" })
        }

        // TAKE ALL REQU.BODY DATA IN SINGLE VARIABLE-----
        let newReview = {
            bookId: bookId,
            reviewedBy: reviewedBy,
            reviewedAt: Date(),
            rating: rating,
            review: review
        }

        let createdReview = await ReviewModel.create(newReview)

        // FIND BOOK DOCUMNET FOR UPDATE REVIEWS COUNT-----
        let Reviews = await ReviewModel.find({ bookId: bookId, isDeleted: false })
        let count = Reviews.length

        // UPDATE REVIEW COUNT AFTER EVERY NEW REVIEW-----
        let updatedBook = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: { reviews: count } }, { new: true })

        return res.status(200).send({ status: true, message: "Books List!", data: { ...updatedBook.toObject(), reviewsData: createdReview } })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}




const updateReview = async (req, res) => {
    try {
        //FETCH DATA FROM REQ.BODY AND DESTRUCTURING IT----
        let { reviewedBy, rating, review } = req.body

        // FETCH BOOK ID AND REVIEW ID FROM THE PARAMS-----
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        // VALIDATE THE GIVEN BOTH OBJECT ID -----
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID , BOOKS" })
        }
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID , REVIEWS" })
        }

        // FIND BOOK DOCUMENT BY BOOK ID AND BOOK WAS NOT DELETED----
        let isBookExist = await BookModel.findOne({ _id: bookId})

        if (!isBookExist) {
            return res.status(404).send({ status: false, message: "NO BOOK FOUND " })
        }
        if (isBookExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "THIS BOOK IS DELETED" })
        }

        // FIND REVIEW DOCUMENT BY REVIEW-ID, REVIEW WAS NOT DELETED-----
        let isReviewExist = await ReviewModel.findOne({ _id: reviewId})
        if (!isReviewExist) {
            return res.status(404).send({ status: false, message: "NO REVIEW FOUND" })
        }
        if (isReviewExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "THIS REVIEW IS DELETED" })
        }

        // COMPARE BOOK-ID WITH BOOK-ID PRESENT IN REVIEW-----
        if (isReviewExist.bookId != bookId) {
            return res.status(400).send({ status: false, message: `THE REVIEW WITH ${reviewId} ID IS NOT THE REVIEW OF BOOK WITH ${bookId} ID` })
        }
        // CHECK UPDATE DATA PRESENT IN REQUEST BODY----
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "NO DATA IN REQ BODY" })

        // UPDATE THE GIVEN DATA IN THE REVIEW DOCUMENT----
        else if (reviewedBy || rating || review) {

            //UPDATE REVIEW DOCUMENT WITH GIVEN DATA-----
            let updatedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { reviewedBy: reviewedBy, rating: rating, review: review } }, { new: true })

            // FIND REVIEW BY BOOK ID FOR UPDATE COUNT OF REVIEWS IN BOOK DOCUMENT----
            let Reviews = await ReviewModel.find({ bookId: bookId, isDeleted: false })
            let count = Reviews.length

            // UPDATE REVIEWS COUNT IN BOOK DOCUMENT----
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
        // FETCH BOOK AND REVIEW ID FROM PARAMS-----
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        
        // VALIDATE THE BOTH OBJECT-ID'S-----
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID,BOOKS" })
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }

        // FIND REVIEW DOCUMENT BY REVIEW ID AND REVIEW WAS NOT DELETED-----
        let review = await ReviewModel.findOne({ _id: reviewId })

        if (!review) {
            return res.status(404).send({ status: false, message: "NO REVIEW FOUND" })
        }
        if (review.isDeleted == true) {
            return res.status(404).send({ status: false, message: "REVIEW ALREADY DELETED" })
        }


        // FIND BOOK DOCUMENT BY BOO ID AND BOOK NOT DELETED----
        let book = await BookModel.findOne({ _id: bookId})

        if (!book) {
            return res.status(404).send({ status: false, message: "NO BOOK FOUND " })
        }
        if (book.isDeleted == true) {
            return res.status(404).send({ status: false, message: "THE BOOK IS DELETED" })
        }

        // MATCH BOOK-ID WITH BOOK-ID PRESENT IN REVIEWS----
        if (review.bookId != bookId) {
            res.status(400).send({ status: false, message: `THE REVIEW WITH ${reviewId} ID IS NOT THE REVIEW OF BOOK WITH ${bookId} ID` })
        }

        // DELETE REVIEW FROM REVIEW COLLECTION----- 
        let deletedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { isDeleted: true, deletedAt: Date() })

        // UPDATE REVIEWS COUNT IN BOOK DOCUMENT----
        if (deletedReview) {
            let updateBook = await BookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }

        return res.status(200).send({ status: true, message: "REVIEW SUCCESSFULLY DELETED", data: `ID ${reviewId}` })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { createReview, updateReview, deleteReview }