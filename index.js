const express =require('express')
require('dotenv').config()
const connecion =require('./db/connection')
const consumptionTime=require('./routes/consumptionTime')
const prescription=require('./routes/prescription')
const swaggerJdoc=require("swagger-jsdoc")
const swaggerUi=require('swagger-ui-express')
const prescriptionMedicineModel = require('./db/prescribeMedicine')
// require('./test')
const swagDoc =require('./swagger.json')
const cors=require('cors')
const app= express()
app.use(cors())
app.use(express.json())

app.use('/consumption',consumptionTime)
app.use('/prescription',prescription)

const options={
    definition:{
        openUi:"3.0.0",
        info:{
            title:"Nodejs APi Rav",
            versiom:"1.0.0"
        },
        servers:[
            {
                url:"http://localhost:5000",
                description:"local server"
            }
        ]
    },
    apis:['./test.js']
}

const PORT =process.env.PORT


const swagerSpec =swaggerJdoc(options)
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swagDoc))


app.listen(PORT,async ()=>{
    
    console.log(`server is running at port ${PORT}`)
})

