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
import {
  PREFIX,
  Refresh_SECRET_KEY,
  SALT_ROUNDS,
  SECRET_KEY,
} from "../../../config/config.service.js";
import { generateOtp, sendEmail } from "../../common/utils/emial/sendEmail.js";
import cloudinary from "../../common/utils/cloudinary.js";
import { model } from "mongoose";
import { randomUUID } from "crypto";
import revokeTokenModel from "../../DB/Models/revokeToken.model.js";
import {
  block_OtpKey,
  deleteKey,
  getValue,
  get_Key,
  incr,
  key,
  max_OtpKey,
  otpKey,
  revoked_key,
  setValue,
  ttl,
} from "../../DB/redis/redis.service.js";
import eventemitter from "../../common/utils/emial/email.event.js";
import { emailTemplate } from "../../common/utils/emial/email.template.js";
import e from "express";
import { emailEventEnum } from "../../common/enum/email.enum.js";

const sendEmailotp = async ({email,subject}={}) => {
  const blocked = await ttl({ key: block_OtpKey({ email }) });
  if (blocked > 0) {
    throw new Error(
      `you are blocked from requesting otp, please try again after ${bloced}seconds`,
      { cause: 429 }
    );
  }
  const otpTtl = await ttl({ key: otpKey({ email,subject }) });
  if (otpTtl > 0) {
    throw new Error(`you can request new otp after ${otpTtl} seconds`, {
      cause: 400,
    });
  }
  const maxOtp = await getValue({ key: max_OtpKey({ email }) });
  if (maxOtp >= 3) {
    await setValue({ key: block_OtpKey({ email }), value: 1, ttl: 60 * 1 });
    throw new Error(
      `you have exceeded the maximum number of otp requests, please try again later`,
      { cause: 429 }
    );
  }
  const otp = await generateOtp();
  eventemitter.emit(emailEventEnum.confiemEmail, async () => {
    await sendEmail({
      to: email,
      subject: "welcome",
      html: emailTemplate(otp),
    });
    await setValue({
      key: otpKey({ email,subject }),
      value: Hash({ plainText: `${otp}` }),
      ttl: 60 * 2,
    });
    await incr({ key: max_OtpKey({ email }) });
  })
};

export const signUp = async (req, res, next) => {
  const { userName, email, password, cpassword, age, gender, phone } = req.body;
  if (await DBS.findone({ model: userModel, filter: { email } })) {
    res.status(409).json({ message: `email already exist` });
    throw new Error("email already exist", { cause: 402 });
  }
  if (req.file) {
    var { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "Saraha_App_Matar",
        public_id: "Matar",
        // use_filename:true,
        // unique_filename:false,
        // resource_type:"video"
      }
    );
  }
  // let arr_paths = [];
  // for (const file of req.files.attachments) {
  //   arr_paths.push(file.path);
  // }
  // if (password != cpassword) {
  //   throw new Error("password not matched", { cause: 400 });
  // }
  const user = await DBS.create({
    model: userModel,
    data: {
      userName,
      email,
      password: Hash({ plainText: password }, { salt_rounds: SALT_ROUNDS }),
      phone: encrypt(phone),
      age,
      gender,
      profilePicture: { secure_url, public_id },
      // coverPictures: arr_paths,
    },
  });

  const otp = await generateOtp();
  eventemitter.emit(emailEventEnum.confiemEmail, async () => {
    await sendEmail({
      to: email,
      subject: "welcome",
      html:  emailTemplate(otp),
    });
    await setValue({
      key: otpKey({ email,subject:emailEventEnum.confiemEmail }),
      value: Hash({ plainText: `${otp}` }),
      ttl: 60 * 2,
    });
    await setValue({ key: max_OtpKey({ email }), value: 1, ttl: 30 });
  });
  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secritKey: SECRET_KEY,
    options: {
      expiresIn: "1h",
      jwtid: uuidv4(),
    },
  });
  successResponse({ res, status: 201, data: user, accessToken });
};

export const confirmEmail = async (req, res, next) => {
  const { email, code } = req.body;
  const otpValue = await getValue({ key: otpKey({ email,subject:emailEventEnum.confiemEmail }) });
  if (!otpValue) {
    throw new Error("otp expired");
  }
  if (!Compare({ plainText: code, cipherText: otpValue })) {
    throw new Error("inValid otp");
  }
  const user = await DBS.findAndupdateOne({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: false },
      provider: providerEnum.system,
    },
    update: { confirmed: true },
  });
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  await deleteKey({ key: `otp::${email}` });
  await deleteKey({ key: max_OtpKey({ email }) });
  successResponse({
    res,
    status: 201,
    message: "email confirmed successfully",
  });
};
export const resendOtp = async (req, res, next) => {
  const { email } = req.body;

  const user = await DBS.findone({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: false },
      provider: providerEnum.system,
    },
  });
  if (!user) {
    throw new Error("user not found or has been confirmed", { cause: 404 });
  }
  await sendEmailotp({email,subject:emailEventEnum.confiemEmail});

  successResponse({
    res,
    status: 201,
    message: "email confirmed successfully",
  });
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
  const user = await userModel.findOne({
    email,
    provider: providerEnum.system,
    confirmed: { $exists: true },
  });
  if (!user) {
    //   res.status(409).json({ message: `user does not exist` });
    throw new Error("user does not exist", { cause: 404 });
  }
  if (!Compare({ plainText: password, cipherText: user.password })) {
    //   res.status(400).json({ message: `invalid password` });
    throw new Error("invalid password", { cause: 600 });
  }
  const jwtid = randomUUID();
  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secritKey: SECRET_KEY,
    options: {
      expiresIn: "1h",
      // issuer:"Matar",
      // audience:"People",
      jwtid,
      // noTimestamp:true,
      // notBefore:'1m'
    },
  });
  const refreshToken = generateToken({
    payload: { id: user._id, email: user.email },
    secritKey: Refresh_SECRET_KEY,
    options: {
      expiresIn: "7d",
      jwtid,
    },
  });
  successResponse({
    res,
    message: "Successful sign in",
    data: { accessToken, refreshToken },
  });
};
export const forgotPassword = async (req, res, next) => {
  const { email} = req.body;
  const user = await userModel.findOne({
    email,
    provider: providerEnum.system,
    confirmed: { $exists: true },
  });
  if (!user) {
    //   res.status(409).json({ message: `user does not exist` });
    throw new Error("user does not exist", { cause: 404 });
  }
  await sendEmailotp({email,subject:emailEventEnum.forgotPassword});
  successResponse({
    res,
    status: 201,
    message: "otp sent to email successfully",
  });
};
export const resetPassword = async(req,res,next)=>{
  const {email,code,password} = req.body
  
  const otpValue =await getValue({ key: otpKey({ email, subject: emailEventEnum.forgotPassword }) })
  if (!otpValue) {
    throw new Error("otp expired");
  }
  if (!Compare({ plainText: code, cipherText: otpValue })) {
    throw new Error("inValid otp");
  }
  const user = await DBS.findAndupdateOne({
    model : userModel,
    filter:{
      email,
      provider:providerEnum.system,
      confirmed:{$exists:true}
    },
    update:{
      password: Hash({plainText:password}),
      changeCredentials : new Date()  
    }
  })
  if(!user){
    throw new Error("user does not exist")
  }
  await deleteKey(otpKey({email,subject:emailEventEnum.forgetPassword}))
  successResponse({res,status:201,message:`Password has been Reseted`})
}
export const getProfile = async (req, res, next) => {
  const key = `profile::${req.user._id}`;
  if (userExists) {
    return successResponse({ res, status: 201, data: req.user });
  }
  await setValue({ key, value: req.user, ttl: 60 });

  successResponse({ res, status: 201, data: req.user });

  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secritKey: SECRET_KEY,
  });

  // const {id} = req.params;
  successResponse({ res, status: 201, data: req.user });
  // successResponse({res,status:201,data:{...user._doc,phone:decrypt(user.phone)}})
};

export const refresh_Token = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token does not exist");
  }
  const [prefix, token] = authorization.split(" ");
  if (prefix !== PREFIX) {
    throw new Error("inValid prefix");
  }
  const decoded = verifyToken({ token, secritKey: Refresh_SECRET_KEY });
  const user = await DBS.findone({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    res.status(409).json({ message: `email already exist` });
    throw new Error("user not found", { cause: 402 });
  }
  if (!decoded || !decoded?.id) {
    throw new Error("inValid token");
  }
  const isRevoked = await DBS.findone({
    model: revokeTokenModel,
    filter: { tokenId: decoded.jti },
  });
  if (isRevoked) {
    throw new Error("token is revoked");
  }
  const accessToken = generateToken({
    payload: { id: user._id, email: user.email },
    secritKey: SECRET_KEY,
    options: {
      expiresIn: "1h",
      jwtid: uuidv4(),
    },
  });
  successResponse({ res, status: 201, data: accessToken });
};

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await DBS.findone({
    model: userModel,
    filter: { _id: id },
    select: "-password",
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  user.phone = decrypt(user.phone);
  successResponse({ res, status: 201, data: user });
};

export const updateProfile = async (req, res, next) => {
  let { firstName, lastName, phone, gender } = req.body;

  if (phone) {
    phone = encrypt(phone);
  }

  const user = await DBS.findAndupdateOne({
    model: userModel,
    filter: { _id: req.user._id },
    update: { firstName, lastName, phone, gender },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  await deleteKey({ key: `profile::${req.user._id}` });

  successResponse({ res, status: 201, data: user });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!Compare({ plainText: oldPassword, cipherText: req.user.password })) {
    throw new Error("invalid old password", { cause: 400 });
  }

  const hash = Hash({ plainText: newPassword });
  req.user.changeCredentials = new Date();
  await DBS.updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    update: { password: hash },
  });
  successResponse({ res, status: 201, data: "password updated successfully" });
};

export const logOut = async (req, res, next) => {
  const { flag } = req.query;
  if (flag === "all") {
    req.user.changeCredentials = Date.now();
    await req.user.save();
    await deleteKey(await key(get_Key({ userId: req.user._id })));
  } else {
    await setValue({
      key: revoked_key({ userId: req.user._id, jti: req.decoded.jti }),
      value: req.user._id,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
    });
    // await DBS.create({
    //   model:revokeTokenModel,
    //   data:{
    //     userId:req.user._id,
    //     tokenId:req.decoded.jti,
    //     expiresAt:new Date(req.decoded.exp * 1000)
    //   }
    // })
  }
  successResponse({ res });
};
