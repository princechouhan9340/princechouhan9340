const urlModel = require("../models/urlModel")
const validUrl = require('valid-url')
const shortid = require('short-id')
const redis = require("redis");

const { promisify } = require("util");

// THIS IS BASE URL-----
const baseUrl = 'http:localhost:3000'

//Connect to redis
const redisClient = redis.createClient(
    13190,
    "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });

  //Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const shortUrl = async function (req, res) {
    try {
        // DESTRUCTURING DATA FETCH BY REQ.BODY----
        const { longUrl } = req.body

        //CHECK REQ.BODY IS EMPTY OR NOT----
        if(Object.keys(req.body).length == 0){
            return res.status(400).send({status:false, message:"please enter lomg url in req.body"})
        }

        // CHECK VALIDATION OF GIVEN LONG URL-----
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Invalid Long URL" })
        }

        // CHECK VALIDATION OF GIVEN BASE URL-----
        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, message: "Invalid Base URL" })
        }

        // GENERATE URLCODE------
        const urlCode = shortid.generate()
        // const urlCode = "428d08"
        console.log(urlCode)
        
        // FIND DOCUMENT CONTAINING SAME URLCODE PRESENT OR NOT IN DB OR IN CASH IF IT IS IN DB SET INTO CACHE-----
        let cahcedUrlCodeData = await GET_ASYNC(`${urlCode}`)
        if(cahcedUrlCodeData) {
                return res.status(400).send({ status: false, message: "UrlCode alrady present in CACHE" })
        } else {
            const findUrlCode = await urlModel.findOne({urlCode:urlCode})
          await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrlCode))
          if(findUrlCode){
            return res.status(400).send({ status: false, message: "UrlCode alrady present in db" })
        }
        }

        // FIND LONG URL ALRADY PRESENT OR NOT IN DB OR IN CASH IF IT IS IN DB SET INTO CACHE----
        let cahcedLongUrlData = await GET_ASYNC(`${longUrl}`)
        if(cahcedLongUrlData) {
                return res.status(400).send({ status: false, message: "Url alrady shorted in CACHE" })
        } else {
            let url = await urlModel.findOne({ longUrl })
          await SET_ASYNC(`${longUrl}`, JSON.stringify(url))
          if (url) {
            return res.status(400).send({ status: false, message: "URL alrady shorted in db" })
        }
        }
        
        // CREATE SHORT URL----
        const shortUrl = baseUrl + '/' + urlCode
        // const shortUrl ="http:localhost:3000/bd1ba0"
        console.log(shortUrl)

        // FIND DOCUMENT HAVING SAME SHORTURL PRESENT OR NOT IN DB OR IN CASH IF IT IS IN DB SET INTO CACHE-----
        let cahcedShortUrlData = await GET_ASYNC(`${shortUrl}`)
        if(cahcedShortUrlData) {
                return res.status(400).send({ status: false, message: "Short-Url alrady present in CACHE" })
        } else {
            const findShortUrl = await urlModel.findOne({shortUrl:shortUrl})
          await SET_ASYNC(`${shortUrl}`, JSON.stringify(findShortUrl))
          if(findShortUrl){
            return res.status(400).send({ status: false, message: "Short-Url alrady present in db" })
        }
        }

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

// REDIRECTING TO THE LONG URL----
const redirectUrl = async function (req, res) {
    try {
        //FETCH URLCODE FROM PARAMS----
        let shortId = req.params.urlCode

        // FINDING IN DATABASE----
        let originalUrlDetails = await urlModel.findOne({ urlCode: shortId })
        console.log(originalUrlDetails)

        if (originalUrlDetails) {
            return res.status(302).redirect(originalUrlDetails.longUrl)
        } else {
            return res.status(404).send({status: false, msg: "No URL Found"})
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

// EXPORT MODULE AND MAKE IT PUBLIC-----
module.exports.shortUrl = shortUrl
module.exports.redirectUrl = redirectUrl