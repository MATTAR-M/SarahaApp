import joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import { generalRules } from "../../common/utils/generalRules.js";
import { fileTypeEnum } from "../../common/enum/Multer.enum.js";

export const signUpSchema = {
  body: joi
    .object({
      userName: joi.string().min(10).max(40).required(),
      email: generalRules.email.required(),
      password: generalRules.password.required(),
      phone: joi.string().required(),
      cpassword: generalRules.cpassword.required(),
      age: joi.number().min(13).max(70).integer().positive().required(),
      gender: joi
        .string()
        .valid(...Object.values(genderEnum))
        .required(),
      // DOB:joi.date().greater("now")
      // user:joi.object({
      //     name:joi.string().required(),
      //     age:joi.number()
      // }).length(2).required()
    })
    .required()
    .with("password", "cpassword")
    .messages({
      "any.required": "body must not be empty",
    }),
  file: generalRules.file.required(),
  files: joi.array().items(generalRules.file).max(2).required(),
  files: joi.object({
    attachment: joi.array().max(1).items(generalRules.file).max(1).required(),
    attachments: joi.array().max(3).items(generalRules.file).max(1).required(),
  }),
};
export const signInSchema = {
  body: joi
    .object({
      email: generalRules.email.required(),
      password: generalRules.password.required(),
    })
    .required(),
};
export const shareProfileSchema = {
    params: joi.object({
        id: generalRules.id.required(),
    }).required(),    
}
export const updateProfileSchema = {
    body : joi.object({
        firstName: joi.string().trim().min(3).max(40),
        lastName: joi.string().trim().min(3).max(40),
        phone: joi.string(),
        gender: joi.string().valid(...Object.values(genderEnum)),
    })
}
export const updatePasswordSchema = {
    body : joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
        cnewPassword: joi.string().valid(joi.ref("newPassword")).required(),
    }).required()
}   