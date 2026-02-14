import userModel from "../../DB/Models/user.model.js";
import * as DBS from "../../DB/db.service.js";
import { genderEnum, providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.succ.js";


export const signUp = async (req, res, next) => {
    const { userName, email, password, age, gender } = req.body;
    if (await DBS.findone({model:userModel,filter:{email}})) {
    //   res.status(409).json({ message: `email already exist` });
    throw new Error("email already exist",{cause:402})
    }
    const user = await DBS.create({
      model: userModel,
      data: {
        userName,
        email,
        password,
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
    if (password != user.password) {
    //   res.status(400).json({ message: `invalid password` });
    throw new Error("invalid password",{cause:600})    
    }
    successResponse({res,data:user})
};
