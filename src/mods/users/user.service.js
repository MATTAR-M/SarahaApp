import userModel from "../../DB/Models/user.model.js";
import * as DBS from "../../DB/db.service.js";
import { genderEnum, providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.succ.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
// import {hashSync,compareSync} from "bcrypt";
import { Compare, Hash } from "../../common/utils/security/hash.secruity.js";

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
    successResponse({res,message:"Successful sign in",data:user})
};
export const getProfile = async (req, res, next) => {
  const {id} = req.params;
  const user = await DBS.findone({model:userModel,filter:{_id:id}}) 
  if (!user) {
  //   res.status(409).json({ message: `email already exist` });
  throw new Error("user not found",{cause:402})
  } 
  successResponse({res,status:201,data:{...user._doc,phone:decrypt(user.phone)}})
}