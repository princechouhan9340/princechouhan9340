const urlModel = require("../models/urlModel")
const validUrl = require('valid-url')
const shortid = require('short-id')

// THIS IS BASE URL-----
const baseUrl = 'http:localhost:3000'

const shortUrl = async function (req, res) {
    try {
        // DESTRUCTURING DATA FETCH BY REQ.BODY----
        const { longUrl } = req.body

        // CHECK VALIDATION OF GIVEN LONG URL-----
        if(!validUrl.isUri(longUrl)){
            return res.status(401).send({ status: false, message: "Invalid Long URL" })
        }

        // CHECK VALIDATION OF GIVEN BASE URL-----
        if (!validUrl.isUri(baseUrl)) {
            return res.status(401).send({ status: false, message: "Invalid Base URL" })
        }

        // GENERATE URLCODE------
        const urlCode = shortid.generate()
        console.log(urlCode)

        // FIND LONG URL ALRADY PRESENT OR NOT IN DB----
        let url = await urlModel.findOne({ longUrl })

        if (url) {
            return res.status(400).send({ status: false, message: "URL alrady shorted" })
        }

        // CREATE SHORT URL----
        const shortUrl = baseUrl + '/' + urlCode
        console.log(shortUrl)

        // MAKE OBJECT CONTAINING ALL MANDATORY FIELDS-----
        let createUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }
        // CREATE DOCUMENT IN DB------
        let createdata = await urlModel.create(createUrl)
        res.status(201).send({ status: true, data: createdata })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}
// EXPORT MODULE AND MAKE IT PUBLIC-----
module.exports.shortUrl = shortUrl