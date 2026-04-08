import joi from "joi";
import { Types } from "mongoose";


// const custom_Id = (v,h)=>{
//   const value = Types.ObjectId.isValid(v)
//   return isValid ? v : h.message("id is not valid")
// }






export const generalRules = {
  email: joi
    .string()
    .email({ tlds: { allow: ["com", "outlook"] } }),
  password: joi.string().min(4).messages({
    "any.required": "body must not be empty",
  }),
  cpassword: joi.string().valid(joi.ref("password")),

  file: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().required(),
  }).messages({
    'any.required': 'file is required',
  }),   
  id : joi.string().hex().custom((value, helpers) => {
    const isValid = Types.ObjectId.isValid(value);
    return isValid ? value : helpers.error("inValid Id");
  })
};
