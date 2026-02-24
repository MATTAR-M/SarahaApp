import joi from "joi"
import { genderEnum } from "../../common/enum/user.enum.js"


export const signUpSchema = {
    body:joi.object({
        userName: joi.string().min(10).max(40).required(),
            email: joi.string().email({tlds:{allow:["com","outlook"]}}).required(),
            password: joi.string().min(4).messages({
                "any.required":"body must not be empty"
            }).required(),
            phone: joi.string().required(),
            cpassword: joi.string().valid(joi.ref("password")).required(),
            age: joi.number().min(13).max(70).integer().positive().required(),
            gender: joi.string().valid(...Object.values(genderEnum)).required(),
            // DOB:joi.date().greater("now")
            // user:joi.object({
            //     name:joi.string().required(),
            //     age:joi.number()
            // }).length(2).required()
    }) .required().with("password","cpassword").messages({
        "any.required":"body must not be empty"
    }),
    
}
    
    
export const signInSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).required()
}) .required()
}
   