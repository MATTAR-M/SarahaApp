import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validators.js";
import * as UV from "../users/user.validation.js";
import { multer_local, multer_host } from "../../common/middleware/multer.js";
import { fileTypeEnum } from "../../common/enum/Multer.enum.js";
import messageRouter from "../messages/message.controller.js";
const userRouter = Router({caseSensitive: true, strict: true});
userRouter.use("/:id/messages",messageRouter)
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
userRouter.post(
  "/signup",
  multer_host(fileTypeEnum.image).single("attachment"),
  US.signUp
);
userRouter.patch(
  "/confirm-email",
  // Validation(UV.confirmEmailSchema),
  US.confirmEmail
);
userRouter.post("/resend-otp", US.resendOtp);
userRouter.post(
  "/signin",
  multer_local({
    path: "users/admin",
    type: [...fileTypeEnum.image, ...fileTypeEnum.pdf],
  }).single("attachment"),
  Validation(UV.signInSchema),
  US.signIn
);
userRouter.get(
  "/profile",
  authentication,
  authorization([RoleEnum.user]),
  US.getProfile
);
userRouter.get("/rToken", US.refresh_Token);
userRouter.get(
  "/share-profile/:id",
  Validation(UV.shareProfileSchema),
  US.shareProfile
);
userRouter.patch(
  "/resetpassword",
  Validation(UV.resetPasswordSchema),
  US.resetPassword
);
userRouter.patch(
  "/forgotpassword",
  Validation(UV.resendOtpSchema),
  US.forgotPassword
);
userRouter.patch(
  "/update-profile",
  Validation(UV.updateProfileSchema),
  authentication,
  US.updateProfile
);

userRouter.patch(
  "/update-password",
  authentication,
  Validation(UV.updatePasswordSchema),
  US.updatePassword
);
userRouter.post("/logout", authentication, US.logOut);
export default userRouter;
