const  consumptionModel =require( "../db/consumptionTime")

 const consumptionTimeController={
    getAll,
    add
}

function getAll() {
    return (req,res)=>{
        consumptionModel.find().then((resItems)=>{
            res.send({message:"ok", data:resItems})
        }).catch((err)=>{
            res.status(400).send({message:"Something went wrong"})
        })
    }
}

function add() {
   return  (req,res)=>{
        if(req.body.name){  
    
            checkIfPresentInDataBase(consumptionModel,req.body.name).then((resItem)=>{
                
                if(resItem){
                    res.send({message:"Already present in database"})
                }else{
                     consumptionModel.create({
                        name:req.body.name
                    }).then((resItem)=>{
                        console.log(resItem)
            
                        res.send({message:"Consumption time Saved"})
                    }).catch((err)=>{
                        console.log(err)
                        res.status(400).send({message:"Consumption time Saving error "})
                    })
                }
            }).catch((err)=>{
        
            })    
        
    
        }else{
            res.status(400).send({message:"Please provide name"})
        }
    }
}
module.exports=consumptionTimeController