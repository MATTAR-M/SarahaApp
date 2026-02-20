import { Router } from "express";
import * as US from './user.service.js'
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validators.js";
import * as UV from "../users/user.validation.js"
const userRouter = Router()

userRouter.post('/signup',Validation(UV.signUpSchema),US.signUp)
userRouter.post('/signup/gmail',US.signUpWithGmail)

userRouter.post('/signin',Validation(UV.signInSchema),US.signIn)
userRouter.get('/profile',authentication,authorization([RoleEnum.user]),US.getProfile)

export default userRouter