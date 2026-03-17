import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validators.js";
import * as UV from "../users/user.validation.js";
import { multer_local,multer_host } from "../../common/middleware/multer.js";
import { fileTypeEnum } from "../../common/enum/Multer.enum.js";
// import {multer_enum } from "../../common/enum/multer.enum.js"  <= add this file with it's corrisponding logic after reviewing the videos
const userRouter = Router();

// userRouter.post(
//   "/signup",
//   multer_local({ type: [...fileTypeEnum.image] }).fields([
//     { name: "attachment", maxCount: 1 },
//     { name: "attachments", maxCount: 2 },
//   ]),
//   US.signUp
//   );
// Validation(UV.signUpSchema),
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.post('/signup',multer_host(fileTypeEnum.image).single("attachment"),US.signUp)

userRouter.post(
  "/signin",
  multer_local({
    path: "users/admin",
    type: [...fileTypeEnum.image, ...fileTypeEnum.pdf],
  }).single("attachment"),
  US.signIn
);
userRouter.get(
  "/profile",
  authentication,
  authorization([RoleEnum.user]),
  US.getProfile
);

export default userRouter;
