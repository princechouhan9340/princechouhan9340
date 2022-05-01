obj2 ={
    tags : [ 'first   '," Second    ", " "],
    subcategory: 'first sub category        '
}





for (let key in obj2) {
    if (typeof (obj2[key]) == "string") {
        obj2[key] = obj2[key].split(",")
    }
    for (let i = 0; i < obj2[key].length; i++)
        obj2[key][i] = obj2[key][i].toLowerCase().trim()

    obj2[key] = { $all: obj2[key] }
}

console.log(obj2)