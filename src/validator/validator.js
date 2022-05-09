const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length == 0) return false
    return true
}

const isTitleValid= function(value){
    if (value == "Mr" ||value =="Miss" ||value =="Mrs") return true
    return false
}
const isPhoneValid = function (value){
    if (!value) return false
    if(value.length!=10) return false
    return true
}
const isEmailValid = function(value){}
module.exports={isValid,isTitleValid,isPhoneValid}