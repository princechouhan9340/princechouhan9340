const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserController')
const bookController = require('../controllers/Bookcontroller')
const {authentication,authorization} = require('../middlewares/middlware')
const reviewController = require('../controllers/ReviewController')

router.post('/register',userController.createUser)

router.post("/login",userController.loginUser )

router.post("/books",authentication,bookController.createBook)

router.get("/books",authentication,bookController.getBooks)

router.get('/books/:bookId',authentication,bookController.getBooksById)

router.put('/books/:bookId',authorization,bookController.updateBook)

router.delete('/books/:bookId',authorization,bookController.deleteBook)

router.post('/books/:bookId/review', reviewController.createReview)

router.put("/books/:bookId/review/:reviewId",reviewController.updateReview )

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview )

module.exports=router