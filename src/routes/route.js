const express = require("express")
const authorController = require("../controller/authorController")
const blogController=require("../controller/blogController")
const authentication=require("../middleware/authentication")
const authorisation=require("../middleware/authorisation")
const router = express.Router()

router.post("/authors",authorController.createAuthor)

router.post("/blogs",authentication.tokenAuth,blogController.createBlogs)

router.get("/blogs",authentication.tokenAuth,blogController.getBlogs)

router.put("/blogs/:blogId",authentication.tokenAuth,authorisation.authorisation,blogController.updateBlogs)

router.delete("/blogs/:blogId",authentication.tokenAuth,authorisation.authorisation,blogController.deleteBlog)

router.delete("/blogs",authentication.tokenAuth,blogController.deleteBlogs)

router.post("/login",authorController.login)
const changeDatabase = require("../controller/changeDatabaseController")
router.get("/change",changeDatabase.changeDatabase)

module.exports = router;