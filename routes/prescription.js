'use strict';
const prescriptionModel = require('../db/prescription')
const router = require('express').Router()
const prescriptionMedicineModel = require('../db/prescribeMedicine')
const PDFDocument = require("pdfkit-table");
const xlsxFile = require('read-excel-file/node');
// const ExcelData=require('./1671694645226.ods')
const fs = require('fs');
const Excel=require('exceljs')
const excelToJson = require('convert-excel-to-json');

const e = require('express');
router.post("/add", (req, res) => {

    if (req.body.name && req.body.age && req.body.gender && req.body.complaints && req.body.allergiesAndDiagnosis && req.body.medicine) {
        let date = new Date()

        prescriptionModel.create({
            patiantName: req.body.name,
            patiantAge: req.body.age,
            patiantGender: req.body.gender,
            complaints: req.body.complaints,
            allergiesAndDiagnosis: req.body.allergiesAndDiagnosis,
            isActive: req.body.isActive,
            createdAt: date,
            isActive: true

        }).then((response) => {

            checkIfValidMedicine(req.body.medicine, response._id).then((resItem) => {
                savePdf(response._id)
            })
            res.send({ message: "prescription saved" })
        }).catch((err) => {

            res.send({ message: "prescription Model errr" })
        })

    } else {
        res.send({ message: "Please provide Entire Feild" })
    }

})


router.put('/update', (req, res) => {

    let transformBOdy = { ...req.body }
    delete transformBOdy.medicine

    if (req.body._id && req.body.name && req.body.age && req.body.gender && req.body.complaints && req.body.allergiesAndDiagnosis) {
        let allDonePromise = new Promise(async (resolve, reject) => {
            let updatedPrescribe = await prescriptionModel.findByIdAndUpdate(transformBOdy._id, {
                patiantName: transformBOdy.name,
                patiantAge: transformBOdy.age,
                patiantGender: transformBOdy.gender,
                complaints: transformBOdy.complaints,
                allergiesAndDiagnosis: transformBOdy.allergiesAndDiagnosis,
                isActive: transformBOdy.isActive
            })

            checkIfValidMedicine(req.body.medicine, req.body._id).then((medicineStatus) => {
                resolve("ok")
                savePdf(req.body._id)
            })
        })
        allDonePromise.then((item) => {
            res.send({ message: "updated" })
        })

    } else {
        res.send({ message: "Please provide Entire Feild" })
    }

})

router.post('/getAll', async (req, res) => {
    let { fromDate, toDate , pageNo,pageSize,isActive} = req.body
     let fornDateConvt=new Date(fromDate)
     let toDateConvt =new Date(toDate)
     console.log(fornDateConvt,"fornDateConvt") 
    console.log(fromDate, toDate,isActive)
    let allPrescription = await prescriptionModel.find({ isActive: isActive!==null?isActive :{$exists:true},patiantName:{ $regex:req.body.searchFeild} }).sort({createdAt:1})
        
    console.log( allPrescription,"allPrescription")

    console.log(pageSize*(pageNo-1),pageSize*pageSize,"pageSize*(pageNo-1),pageSize*pageSize")
    res.send({ message: "ok", data: allPrescription.slice(pageSize*(pageNo-1),pageSize*pageNo), totalCount: allPrescription.length })
    
    
    // let aggregateData= await prescriptionModel.aggregate([{$project:{"createdAtSample":{$concat:["$createdAt","","T11:44:44.116+00:00"]}}}])
    //   await  prescriptionModel.updateMany({},[{$set:{createdAt:{$replaceAll:{input:"$createdAt",find:"T11:44:44.116+00:00",replacement:"" }}}}])

    // await  prescriptionModel.updateMany({},[{$set:{createdAt:{$dateFromString:{dateString:'$createdAt'}}}}])
    // console.log(aggregateData,"aggregateData")
    // let aggDate=    await prescriptionModel.aggregate([{$project:{createdAt:{$dateFromString:{dateString:'$createdAt'}}}}])

    // console.log(aggDate,"aggDate")

    // let finalDataPromise = new Promise((resolve, reject) => {
    //     let overALlData = []
    //     if(allPrescription.length<1){
    //         resolve(allPrescription)
    //     }
    //     else{
    //         allPrescription.map(async (eachPrescription, index) => {

    //             let medicineData = await prescriptionMedicineModel.count({ parentId: eachPrescription._id, isActive: true })
    
    //             eachPrescription.medicine = "data"
    //             let clonePrescription = {}
    //             clonePrescription._id = eachPrescription._id
    //             clonePrescription.patiantName = eachPrescription.patiantName
    //             clonePrescription.patiantAge = eachPrescription.patiantAge
    //             clonePrescription.patiantGender = eachPrescription.patiantGender
    //             clonePrescription.complaints = eachPrescription.complaints
    //             clonePrescription.allergiesAndDiagnosis = eachPrescription.allergiesAndDiagnosis
    //             clonePrescription.isActive = eachPrescription.isActive
    //             clonePrescription.createdAt = eachPrescription.createdAt
    //             clonePrescription.medicineCount = medicineData
    
    //             overALlData.push(clonePrescription)  
    //             resolve(overALlData)            
    //         })
    //     }       
    // })


    // finalDataPromise.then((result) => {
    //     let sortedData = result.sort((a, b) => {
    //         return new Date(b.createdAt) - new Date(a.createdAt)
    //     })
    //     console.log(sortedData,"sortedData")
    //     res.send({ message: "ok", data: sortedData, totalCount: allPrescription.length })
    // })
})

router.get("/test",(req,res)=>{
    console.loh("hii test")
    res.send({"message":"ravikant"})
})

router.get('/getById/:id', async (req, res) => {
    if (req.params.id) {
        try {
            let allPrescription = await prescriptionModel.findOne({ _id: req.params.id, isActive: true })
            if (allPrescription) {
                let medicineRelate = await prescriptionMedicineModel.find({ parentId: req.params.id, isActive: true })
                let clonePrescription = {}
                clonePrescription._id = allPrescription._id
                clonePrescription.patiantName = allPrescription.patiantName
                clonePrescription.patiantAge = allPrescription.patiantAge
                clonePrescription.patiantGender = allPrescription.patiantGender
                clonePrescription.complaints = allPrescription.complaints
                clonePrescription.allergiesAndDiagnosis = allPrescription.allergiesAndDiagnosis
                clonePrescription.isActive = allPrescription.isActive
                clonePrescription.medicineCount = medicineRelate
                res.send({ message: "data", data: clonePrescription })
            } else {
                res.status(400).send({ message: "no user present", data: {} })
            }

        } catch {
            res.status(400).send({ message: "Please provide Correct id" })
        }



    } else {
        res.status(400).send({ message: "Please provide id", data: allPrescription })

    }
})

const functionForFindMedicine = async (eachPrescription) => {
    let data = await prescriptionMedicineModel.find({ parentId: eachPrescription._id })

}

router.post('/getAllMedicine', (req, res) => {

    prescriptionMedicineModel.findOneAndUpdate({ _id: req.body._id }, req.body).then((updateItem) => {
    })

})
router.delete('/delete/:id', async (req, res) => {

    prescriptionModel.findOneAndUpdate({ _id: req.params.id, isActive: true }, { isActive: false }).then((resI) => {
        if (resI) {
            res.send({ message: "delete" })
        }
        else {
            res.send({ message: "No user presented" })
        }
    }).catch((err) => {

    })
})


router.post('/importPrescription',async (req,res)=>{
    // const data = await fs.readFile('./RaviExcel.xlsx')
    console.log(`${__dirname}`+`/1671694645226.ods`)
    let urlTest=`${__dirname}`+`/excelTestData.xlsx` 
    
    let workbook= new Excel.Workbook()
    console.log( urlTest,"urlTest")
    // const result=excelToJson({
    //     sourceFile:fs.readFileSync( urlTest)
    // })
    
    // console.log(result,"result")
    
    console.log(fs.readFileSync( urlTest),"fs.readFileSync( urlTest)")
       res.send("hiii")
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
                    consumptionTimeName: resItem.consumptionTime.name,
                    isActive: resItem.isActive,

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
                    consumptionTimeName: resItem.consumptionTime.name,
                    isActive: resItem.isActive
                }).then((comple) => {
                    responseObj.newCreate.push(comple._id.toString())
                    return responseObj
                }).catch((err) => {
                    responseObj.message = "Something went wrong. Please check new entries"
                })
            }

        })

    } catch {
        responseObj.status = 400
        responseObj.message = "something went wrong"
        return responseObj

    }

}



const savePdf = async (parentId) => {

    let findedData = await prescriptionMedicineModel.find({ parentId: parentId })
    let parentData = await prescriptionModel.findById(parentId)

    let doc = new PDFDocument({ margin: 30, size: 'A4' });
    let dataFinded = findedData.map((resItem) => {
        return {
            name: resItem.name,
            dosage: resItem.dosage.toString(),
            duration: resItem.duration.toString(),
            quantity: resItem.quantity.toString(),
            consumptionTimeName: resItem.consumptionTimeName
        }
    })
    let filterParentData = {
        name: parentData.patiantName,
        age: parentData.patiantAge.toString(),
        gender: parentData.patiantGender,
        complaints: parentData.complaints,
        allergiesAndDiagnosis: parentData.allergiesAndDiagnosis
    }

    doc.pipe(fs.createWriteStream(`./files/${parentId}.pdf`));

    ; (async function () {
        // table
        const table = {
            title: "Prescription",
            headers: ["Key", "Value"
            ],
            // complex data
            rows: Object.entries(filterParentData),
        };
        const table2 = {
            title: "Medicine",
            headers: [
                { label: "Name", property: 'name', width: 60, renderer: null },
                { label: "Dosage", property: 'dosage', width: 150, renderer: null },
                { label: "Duration", property: 'duration', width: 100, renderer: null },
                { label: "Quantity", property: 'quantity', width: 100, renderer: null },
                { label: "ConsumptionTime", property: 'consumptionTimeName', width: 80, renderer: null }
            ],
            // complex data
            datas: dataFinded,
        };
        // the magic
        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(8);
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
            },
        });

        doc.table(table2, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Helvetica").fontSize(8);
                indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
            },
        });

        doc.end();
    })();

}

