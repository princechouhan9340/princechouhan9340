let axios = require("axios")

let getByPlace = async function (req, res) {
    let cities = ["Bengaluru", "Mumbai", "Delhi", "Kolkata", "Chennai", "London", "Moscow","Bhopal"]
    let cityArray = [];
    for (i = 0; i < cities.length; i++) {

        let obj = { city: cities[i] }
        let options = {
            method: "get",
            url: `http://api.openweathermap.org/data/2.5/weather?q=${cities[i]}&appid=ae35a7ee8d6a1e7500f2c07b65d851fc`

        }

        let result = await axios(options)
        console.log(result.data.main.temp)
        obj.temp = result.data.main.temp
        cityArray.push(obj)
    }
    let sortByTemp = cityArray.sort(function (a, b) { return a.temp - b.temp })
    console.log(sortByTemp)
    res.status(200).send({ status: true, data: sortByTemp })
}


let postmeme = async function(req,res){
    let template_id = req.query.template_id
    let text0 = req.query.text0
    let text1 = req.query.text1
    console.log(template_id,text0,text1)
    var options = {
        method: "post",
        url: `https://api.imgflip.com/caption_image?template_id=${template_id}&text0=${text0}&text1=${text1}&username=chewie12345&password=meme@123`,
      
    }
let result = await axios(options)
console.log(result)
res.send({status:true, data:result.data})

}
// username chewie12345
// password meme@123


module.exports.getByPlace = getByPlace
module.exports.postmeme= postmeme