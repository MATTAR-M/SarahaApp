

export const Validation = (schema) => { 
    return  (req,res,next)=>{
    let errorMessage = []    
    for (const key of Object.keys(schema)) {
    const {error} = schema[key].validate(req[key],{abortEarly:false})
    if (error) {
    errorMessage.push(error.details)
// throw new Error("validation error",error);
}
    if(errorMessage.length>0){
        return res.status(400).json({message:"validation error",error:errorMessage})
    }
   }
next()
}
}