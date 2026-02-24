

export const Validation = (schema) => { 
    return  (req,res,next)=>{
    let errorMessage = []    
    for (const key of Object.keys(schema)) {
    const {error} = schema[key].validate(req[key],{abortEarly:false})
    if (error) {
        error.details.forEach(element => {
            errorMessage.push({
                key,
                path:element.path,
                message:element.message
            })
        });
}
    if(errorMessage.length>0){
        return res.status(400).json({message:"validation error",error:errorMessage})
    }
   }
next()
}
}