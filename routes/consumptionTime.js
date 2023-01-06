const router =require('express').Router()
const { Model } = require('mongoose')
const  consumptionTimeController  = require('../controllers/consumptionTime')
const consumptionModel=require('../db/consumptionTime')


const checkIfPresentInDataBase=async(model,name )=>{
    return model.findOne({name:name})
}
router.post('/add', consumptionTimeController.add())
router.put('/update')
router.get('/getAll',consumptionTimeController.getAll())

module.exports=router

