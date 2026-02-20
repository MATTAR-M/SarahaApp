import joi from "joi"
import { genderEnum } from "../../common/enum/user.enum.js"


export const signUpSchema = {
    body:joi.object({
        userName: joi.string().min(10).max(40).required(),
            email: joi.string().email().required(),
            password: joi.string().min(4),
            phone: joi.string().required(),
            cpassword: joi.string().valid(joi.ref("password")).required(),
            age: joi.number().min(13).max(70).integer().positive().required(),
            gender: joi.string().valid(...Object.values(genderEnum)).required()
    }) .required()
    
}
    
    
export const signInSchema = {
    body: joi.object({
        email: joi.string(),
        password: joi.string().min(4)
}) .required(),

query:joi.object({
    x:joi.number().required() 
}) .required()
}
   