const collegeModel = require("../model/collegeModel")
const internModel = require("../model/internModel")

const createcollege = async function (req, res) {
    try {
        const data = req.body

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, Error: "input is empty, please enter data" })
        }

        if (!data.name || !data.fullName || !data.logoLink) {
            return res.status(400).send({ status: false, Error: "please enter mandatory field" })
        }

        if (typeof (data.name) != "string" || typeof (data.fullName) != "string" || typeof (data.logoLink) != "string") {
            return res.status(400).send({ status: false, Error: "invalid input" })
        }
         
        const findcollege = await collegeModel.findOne({name:data.name})
        if(findcollege){
            return res.status(400).send({status:false,Error:"collage alrady created"})
        }

        const result = await collegeModel.create(data)
        res.status(201).send({ status: true, data: result })
    } catch (err) {
        res.status(500).status({ status: false, Error: err })
    }
}

const getcollegedetail = async function (req, res) {
    try {
        const collegename = req.query
        //{NAME:IITK}
        if (Object.keys(collegename).length == 0) {
            return res.status(400).send({ status: false, Error: "empty request" })
        }
       // collagename={name:    IIITK     },iiit
        let college = Object.values(collegename).toLocaleString().trim()
        console.log(college)
        const findcollege = await collegeModel.findOne({ name: college }).select({ name: 1, fullName: 1, logoLink: 1, _id: 0 })
        const findcollegeid = await collegeModel.findOne({ name: college })//
        console.log(findcollege)
        if (!findcollege) {
            return res.status(400).send({ status: false, Error: "college not found" })
        }

        const result = await internModel.find({ collegeId: findcollegeid._id }).select({ _id: 1, name: 1, email: 1, mobile: 1 })
        res.status(200).send({ status: true, data: findcollege, interns: result })

    } catch (err) {
        res.status(500).send({ status: false, Error: err })
    }
}

module.exports.createcollege = createcollege
module.exports.getcollegedetail = getcollegedetail