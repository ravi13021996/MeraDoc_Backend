const mongoose =require('mongoose')

let medicine =mongoose.Schema({
    parentId:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    dosage:{
        type:String,
        require:true
    },
    duration:{
        type:Number,
        require:true
    },
    quantity:{
        type:Number,
        require:true
    },
    consumptionTime:{
        type:String,
        require:true
    },
    consumptionTimeName:{
        type:String,
        require:true
    },
    isActive:{
        type:Boolean,
        require:true
    }
})

const medicineModel=mongoose.model('prescribeMedicine',medicine)

module.exports =medicineModel
