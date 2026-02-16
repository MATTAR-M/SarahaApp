import jwt from "jsonwebtoken"



export const generateToken = ({payload,secritKey,options={}}={})=>{
    return jwt.sign(payload,secritKey,options)
}

export const verifyToken = ({token,secritKey,options={}}={})=>{
    return jwt.verify(token,secritKey,options)
}