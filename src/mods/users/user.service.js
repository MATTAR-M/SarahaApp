import userModel from "../../DB/Models/user.model.js";
import * as DBS from "../../DB/db.service.js";
import { genderEnum, providerEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.succ.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
// import {hashSync,compareSync} from "bcrypt";
import { Compare, Hash } from "../../common/utils/security/hash.secruity.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  generateToken,
  verifyToken,
} from "../../common/utils/token.serivce.js";
import { authentication } from "../../common/middleware/authentication.js";
import { OAuth2Client } from "google-auth-library";
import { SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
import { generateOtp, sendEmail } from "../../common/utils/emial/sendEmail.js";
import cloudinary from "../../common/utils/cloudinary.js";

export const signUp = async (req, res, next) => {
  const { userName, email, password, cpassword, age, gender, phone } = req.body;
  if (await DBS.findone({ model: userModel, filter: { email } })) {
      res.status(409).json({ message: `email already exist` });
    throw new Error("email already exist", { cause: 402 });
  }
  const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{
    folder:"Saraha_App_Matar",
    // public_id:"Matar",
    // use_filename:true,
    // unique_filename:false,
    // resource_type:"video"
  })

  // let arr_paths = [];
  // for (const file of req.files.attachments) {
  //   arr_paths.push(file.path);
  // }
  // if (password != cpassword) {
  //   throw new Error("password not matched", { cause: 400 });
  // // }
  const user = await DBS.create({
    model: userModel,
    data: {
      userName,
      email,
      password: Hash({ plainText: password }, { salt_rounds: SALT_ROUNDS }),
      phone: encrypt(phone),
      age,
      gender,
      profilePicture: {secure_url,public_id},
      // coverPictures: arr_paths,
    },
  });

  // const otp = await generateOtp()
  // await sendEmail({
  //   to:email,
  //   subject:"welcome",
  //   html:`<h1>hello ${userName}</h1>
  //   <p>welcome on my saraha app your otp : ${otp}</p>`
  // })
  // await setValue({key:`otp::${email}`,value:Hash({plainText:`${otp}`}),})
  // const accessToken = generateToken({
  //   payload: { id: user._id, email: user.email },
  //   secritKey: SECRET_KEY,
  //   options: {
  //     expiresIn: "1h",
  //     jwtid: uuidv4(),
  //   },
  // });
  successResponse({ res, status: 201, data: user });
};

export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  console.log(idToken);
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "927917385163-hd4pahege49ot2i56b6pbf1qb44nrrf8.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  const { email, email_verified, name, picture } = payload;
  let user = await DBS.findone({
    model: userModel,
    filter: { email },
  });
  if (!user) {
    user = await DBS.create({
      model: userModel,
      data: {
        email,
        confirmed: email_verified,
        userName: name,
        profilePicture: picture,
        provider: providerEnum.google,
      },
    });
  }
  if (user.provider == providerEnum.system) {
    throw new Error("please log in with system only", { cause: 406 });
  }
  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secritKey: SECRET_KEY,
    options: {
      expiresIn: "1h",
      jwtid: uuidv4(),
    },
  });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  // const user = await userModel.findOne({
  //   email,
  //   provider: providerEnum.system,
  // });
  // if (!user) {
  //   //   res.status(409).json({ message: `user does not exist` });
  //   throw new Error("user does not exist", { cause: 404 });
  // }
  // if (!Compare({ plainText: password, cipherText: user.password })) {
  //   //   res.status(400).json({ message: `invalid password` });
  //   throw new Error("invalid password", { cause: 600 });
  // }

  // const accessToken = generateToken({
  //   payload: { id: user._id, email: user.email },
  //   secritKey:SECRET_KEY,
  //   options: {
  //     expiresIn: "1h",
  //     // issuer:"Matar",
  //     // audience:"People",
  //     jwtid: uuidv4(),
  //     // noTimestamp:true,
  //     // notBefore:'1m'
  //   },
  // });

  successResponse({
    res,
    message: "Successful sign in",
    // data: { accessToken }
  });
};

export const getProfile = async (req, res, next) => {
  // const {id} = req.params;
  successResponse({ res, status: 201, data: req.user });
  // successResponse({res,status:201,data:{...user._doc,phone:decrypt(user.phone)}})
};
