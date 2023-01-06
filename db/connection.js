const mongoose =require('mongoose')

let URI=process.env.MONGO_URL
 const  connecion= mongoose.connect(URI,{
    useNewUrlParser: true,    
    useUnifiedTopology: true
}).then((res)=>{
    console.log("connecion established")
}).catch((err)=>{
    console.log(err,"connecion error")
})

module.exports=connecion