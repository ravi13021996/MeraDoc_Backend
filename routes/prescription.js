const prescriptionModel = require('../db/prescription')

const router = require('express').Router()
const prescriptionMedicineModel = require('../db/prescribeMedicine')

const  html_to_pdf = require('html-pdf-node');

const  fs =require( 'fs')
router.post("/add", (req, res) => {
    console.log(req.body, "req.body")
    if (req.body.name && req.body.age && req.body.gender && req.body.complaints && req.body.allergiesAndDiagnosis && req.body.medicine) {
       let date =new Date()
        prescriptionModel.create({
            patiantName: req.body.name,
            patiantAge: req.body.age,
            patiantGender: req.body.gender,
            complaints: req.body.complaints,
            allergiesAndDiagnosis: req.body.allergiesAndDiagnosis,
            isActive: req.body.isActive,
            createdAt:date,
            isActive:true

        }).then((response) => {
            console.log(response, "resss")
            checkIfValidMedicine(req.body.medicine, response._id).then((resItem) => {

            })
            res.send({ message: "prescription saved" })
        }).catch((err) => {
            console.log(err)
            res.send({ message: "prescription Model errr" })
        })

    } else {
        res.send({ message: "Please provide Entire Feild" })
    }

})


router.put('/update', (req, res) => {
    console.log(req.body, "before")
    let transformBOdy = {...req.body}
    delete transformBOdy.medicine
    // console.log(transformBOdy, "transformBOdy")


    if (req.body._id &&req.body.name && req.body.age && req.body.gender && req.body.complaints && req.body.allergiesAndDiagnosis) {
        let allDonePromise = new Promise( async (resolve,reject)=>{
            let updatedPrescribe=await prescriptionModel.findByIdAndUpdate(transformBOdy._id, {
                patiantName: transformBOdy.name,
                patiantAge: transformBOdy.age,
                patiantGender: transformBOdy.gender,
                complaints: transformBOdy.complaints,
                allergiesAndDiagnosis: transformBOdy.allergiesAndDiagnosis,
                isActive: transformBOdy.isActive
            })
    
               checkIfValidMedicine(req.body.medicine, req.body._id).then((medicineStatus)=>{
                    resolve("ok")
               })

              
        })
        allDonePromise.then((item)=>{
            res.send({message:"updated"})
        })
        

          

    } else {
        res.send({ message: "Please provide Entire Feild" })
    }


})

router.get('/getAll', async (req, res) => {

    let allPrescription = await prescriptionModel.find({isActive:true})
    console.log(allPrescription.length, "allPrescription")
    

    let finalDataPromise = new Promise((resolve, reject) => {
        let overALlData = []
        allPrescription.map(async (eachPrescription, index) => {

            let medicineData = await prescriptionMedicineModel.count({ parentId: eachPrescription._id, isActive:true })
            console.log(medicineData,"medicineData")
            eachPrescription.medicine = "data"
            let clonePrescription = {}
            clonePrescription._id = eachPrescription._id
            clonePrescription.patiantName = eachPrescription.patiantName
            clonePrescription.patiantAge = eachPrescription.patiantAge
            clonePrescription.patiantGender = eachPrescription.patiantGender
            clonePrescription.complaints = eachPrescription.complaints
            clonePrescription.allergiesAndDiagnosis = eachPrescription.allergiesAndDiagnosis
            clonePrescription.isActive = eachPrescription.isActive
            clonePrescription.medicineCount=medicineData
            



    
            overALlData.push(clonePrescription)
            console.log(overALlData,"overALlData")
            // console.log(index,"index")
            if (overALlData.length === allPrescription.length ) {
                resolve(overALlData)
            }
        })
    })

    
    finalDataPromise.then((result) => {
        let sortedData=result.sort((a,b)=>{
            if ( a.createdAt < b.createdAt ){
                return -1;
              }
              if ( a.createdAt > b.createdAt ){
                return 1;
              }
              return 0;
        })
        console.log(result, "result")
        res.send({message:"ok",data:sortedData,totalCount:allPrescription.length})
    })


})


router.get('/getById/:id',async(req,res)=>{
    console.log(req.params,"req.query")
    if(req.params.id){
     try{
        let allPrescription = await prescriptionModel.findById({_id:req.params.id})
         let medicineRelate= await prescriptionMedicineModel.find({parentId:req.params.id,isActive:true})
        
         console.log(allPrescription,"allPrescription")
         console.log(medicineRelate,"medicineRelate")   
         let clonePrescription = {}
            clonePrescription._id = allPrescription._id
            clonePrescription.patiantName = allPrescription.patiantName
            clonePrescription.patiantAge = allPrescription.patiantAge
            clonePrescription.patiantGender = allPrescription.patiantGender
            clonePrescription.complaints = allPrescription.complaints
            clonePrescription.allergiesAndDiagnosis = allPrescription.allergiesAndDiagnosis
            clonePrescription.isActive = allPrescription.isActive
            clonePrescription.medicineCount=medicineRelate
        res.send({message:"data",data:clonePrescription})
        
    }catch{
        res.status(400).send({message:"Please provide Correct id"})
    }

    
    
    }else{
        res.status(400).send({message:"Please provide id",data:allPrescription})

    }
})
const functionForFindMedicine = async (eachPrescription) => {
    let data = await prescriptionMedicineModel.find({ parentId: eachPrescription._id })

}


router.get('/genPdf',(req,res)=>{
    let options = { format: 'A4' };
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

let file = { content: "<h1>Welcome to html-pdf-node</h1>" };
// or //
// let file = { url: "https://example.com" };
html_to_pdf.generatePdf(file, options).then((pdfBuffer, content) => {
  console.log(content,"PDF Buffer:-", pdfBuffer);
  res.send({data:pdfBuffer})
});


})
router.post('/getAllMedicine', (req, res) => {
    console.log(req.body, "req.body")
    prescriptionMedicineModel.findOneAndUpdate({ _id: req.body._id }, req.body).then((updateItem) => {
        console.log(updateItem, "updateItem")
    })
    // prescriptionMedicineModel.findOne({_id:"637cb7568802f274fb53ecb0"}).then((medicineItem)=>{
    //     console.log(medicineItem,"medicineItem")
    // }).catch((err)=>{

    // })
})
router.delete('/delete/:id',async (req,res)=>{
console.log(req.params,"req.params")
 prescriptionModel.findByIdAndUpdate(req.params.id,{isActive:false}).then((resItem)=>{
    res.send({message:"delete"})
 })


})

module.exports = router

const checkIfValidMedicine = async (data, parentId) => {
    let responseObj = { message: "", newCreate: [], update: "", status: 200 }
    
    try {
        let newCreate = []

        data.map((resItem) => {
            if (resItem._id) {                
                     prescriptionMedicineModel.findOneAndUpdate({ _id: resItem._id }, {
                    name: resItem.name,
                    dosage: resItem.dosage,
                    duration: resItem.duration,
                    quantity: resItem.quantity,
                    consumptionTime: resItem.consumptionTime.id,
                    consumptionTimeName:resItem.consumptionTime.name,
                    isActive:resItem.isActive,
                    
                }).then((updateItem) => {

                    responseObj.newCreate.push(resItem._id.toString())
                    return responseObj
                }).catch((err) => {
                    responseObj.message = "Something went wrong. Please check Update entries"
                })

            } else {               

                 prescriptionMedicineModel.create({
                    parentId: parentId,
                    name: resItem.name,
                    dosage: resItem.dosage,
                    duration: resItem.duration,
                    quantity: resItem.quantity,
                    consumptionTime: resItem.consumptionTime,
                    consumptionTimeName:resItem.consumptionTime.name,
                    isActive: resItem.isActive
                }).then((comple) => {
                    responseObj.newCreate.push(comple._id.toString())
                    return responseObj
                }).catch((err) => {
                    responseObj.message = "Something went wrong. Please check new entries"
                    console.log(err, "medicin save error")
                })
            }

        })

    } catch {
        responseObj.status = 400
        responseObj.message = "something went wrong"
        return responseObj

    }

}



