import { verifyToken } from "../utils/token.serivce.js"
import * as DBS from "../../DB/db.service.js"
import userModel from "../../DB/Models/user.model.js"

export const authentication = async (req,res,next)=>{
  
    const {authorization} = req.headers
    
    if(!authorization){
        throw new Error("token does not exist")
    }
    const [prefix,token] = authorization.split(" ")
    if(prefix !== "bearer"){
        throw new Error("inValid prefix")
    }
    const decoded = verifyToken({token,secritKey:"Doaa"})
    const user = await DBS.findone({model:userModel,filter:{_id:decoded.id}}) 
    if (!user) {
      res.status(409).json({ message: `email already exist` });
    throw new Error("user not found",{cause:402})
    } 
    if(!decoded ||!decoded?.id){
        throw new Error("inValid token")
    }
    req.user=user
    next()
}