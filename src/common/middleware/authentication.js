import { verifyToken } from "../utils/token.serivce.js"
import * as DBS from "../../DB/db.service.js"
import userModel from "../../DB/Models/user.model.js"
import revokeTokenModel from "../../DB/Models/revokeToken.model.js"
import { PREFIX, SECRET_KEY } from "../../../config/config.service.js"
import { get } from "mongoose"
import { getValue } from "../../DB/redis/redis.service.js"

export const authentication = async (req,res,next)=>{
  
    const {authorization} = req.headers
    
    if(!authorization){
        throw new Error("token does not exist")
    }
    const [prefix,token] = authorization.split(" ")
    if(prefix !== PREFIX){
        throw new Error("inValid prefix")
    }
    const decoded = verifyToken({token,secritKey:SECRET_KEY})
    const user = await DBS.findone({model:userModel,filter:{_id:decoded.id}}) 
    if (!user) {
      res.status(409).json({ message: `email already exist` });
    throw new Error("user not found",{cause:402})
    } 
    if(!decoded ||!decoded?.id){
        throw new Error("inValid token payload")
    }
    if(user?.changeCredentials?.getTime()>decoded.iat*1000){
        throw new Error("token is expired")
    }
    const isRevoked = await getValue({key:`revokeToken::${user._id}::${decoded.jti}`})
    if(isRevoked){
        throw new Error("token is revoked")
    }   
    req.user=user
    req.decoded = decoded 
    next()
}