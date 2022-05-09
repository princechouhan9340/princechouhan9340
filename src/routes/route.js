const express = require("express")
const router = express.Router()
const collegecontroller = require('../controller/collegecontroller')
const interncontroller = require('../controller/interncontroller')

router.post('/functionup/colleges',collegecontroller.createcollege)

router.post('/functionup/interns',interncontroller.createintern)

router.get('/functionup/collegeDetails',collegecontroller.getcollegedetail)

module.exports = router;