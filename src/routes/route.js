const express = require("express")
const router = express.Router()
const collagecontroller = require('../controller/collagecontroller')
const interncontroller = require('../controller/interncontroller')

router.post('/functionup/colleges',collagecontroller.createcollage)

router.post('/functionup/interns',interncontroller.createintern)

router.get('/functionup/collegeDetails',collagecontroller.getcollagedetail)

module.exports = router;