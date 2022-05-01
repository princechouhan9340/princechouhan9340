const jwt = require("jsonwebtoken")

const tokenAuth = async function (req, res, next) {
    try {
        const key = req.headers['x-api-key']
        if (!key) { return res.status(403).send({status:false,msg:"Unauthorised access"}) }
        try {
            const tokendata = jwt.verify(key, "Project 1")
             req.tokenId = tokendata.id // req.query  req.tokenId
             next()
        }
        catch (error) {
            res.status(403).send({status:false,msg:"Unauthorised access"});
        }
    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }
}
module.exports.tokenAuth = tokenAuth