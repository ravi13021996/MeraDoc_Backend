const mongoose =require('mongoose')

let prescription =mongoose.Schema({
    patiantName:{
        type:String,
        require:true
    },
    patiantAge:{
        type:String,
        require:true
    },
    patiantGender:{
        type:String,
        require:true
    },
    complaints:{
        type:String,
        require:true
    },
    allergiesAndDiagnosis:{
        type:String,
        require:true
    },
    isActive:{
        type:Boolean,
        require:true
    },
    createdAt:{
        type:Date,
        require:true
    }
    
})

let prescriptionModel=mongoose.model('prescription',prescription)
module.exports=prescriptionModel