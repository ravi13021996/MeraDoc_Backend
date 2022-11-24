const { default: mongoose } = require('mongoose')
const mogoose=require('mongoose')

let consumtion=mongoose.Schema({
    name:{
        type:String,
        require:true
    }
})


let consumptionModel =mongoose.model("consumption",consumtion)
module.exports =consumptionModel