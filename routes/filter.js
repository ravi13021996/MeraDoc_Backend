const router =require('express').Router()
const prescriptionModel = require('../db/prescription')


router.get('/nameFilter',async(req,res)=>{
   let dataName=  await prescriptionModel.find({},"patiantName")
   dataName= dataName.map((items)=>items.patiantName)
   let newSet= new Set(dataName)
   
   let arraFromSet=Array.from(newSet)
   console.log(arraFromSet.length,"arraFromSet.length")
    res.send({data:arraFromSet})  
   
})

router.get('/genderFilter',(req,res)=>{

})


router.get('/createdAtFilter',async (req,res)=>{
    let dataName=  await prescriptionModel.find({},"createdAt")
    res.send({data:dataName})
})


module.exports =router