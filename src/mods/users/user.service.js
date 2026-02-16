import userModel from "../../DB/Models/user.model.js";
import * as DBS from "../../DB/db.service.js";
import { genderEnum, providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.succ.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
// import {hashSync,compareSync} from "bcrypt";
import { Compare, Hash } from "../../common/utils/security/hash.secruity.js";
import jwt from "jsonwebtoken"
import {v4 as uuidv4} from "uuid"
import { generateToken, verifyToken } from "../../common/utils/token.serivce.js";
import {authentication} from "../../common/middleware/authentication.js"
export const signUp = async (req, res, next) => {
    const { userName, email, password,cpassword, age, gender,phone } = req.body;
    if (await DBS.findone({model:userModel,filter:{email}})) {
    //   res.status(409).json({ message: `email already exist` });
    throw new Error("email already exist",{cause:402})
    }
    if(password!=cpassword){
      throw new Error("password not matched",{cause:400})
    }
    const user = await DBS.create({
      model: userModel,
      data: {
        userName,
        email,
        password:Hash({plainText:password}),
        phone:encrypt(phone),
        age,
        gender,
      },
    })
    successResponse({res,status:201,data:user})
}
export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({
      email,
      provider: providerEnum.system,
    });
    if (!user) {
    //   res.status(409).json({ message: `user does not exist` });
    throw new Error("user does not exist",{cause:404})

    }
    if (!Compare({plainText:password,cipherText:user.password})) {
    //   res.status(400).json({ message: `invalid password` });
    throw new Error("invalid password",{cause:600})    
    }

  const accessToken = generateToken({
    payload:{id:user._id,email:user.email},
    secritKey:"Doaa",
    options:{
    expiresIn:"1h",
    // issuer:"Matar",
    // audience:"People",
    jwtid:uuidv4(),
    // noTimestamp:true,
    // notBefore:'1m'
  }})

    successResponse({res,message:"Successful sign in",data:{accessToken}})
};



export const getProfile = async (req, res, next) => {
  // const {id} = req.params;
  successResponse({res,status:201,data:req.user})
  // successResponse({res,status:201,data:{...user._doc,phone:decrypt(user.phone)}})
}