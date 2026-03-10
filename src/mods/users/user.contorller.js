import { Router } from "express";
import * as US from './user.service.js'
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum, fileTypeEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validators.js";
import * as UV from "../users/user.validation.js"
import { multer_local} from "../../common/middleware/multer.js";
// import {multer_enum } from "../../common/enum/multer.enum.js"  <= add this file with it's corrisponding logic after reviewing the videos
const userRouter = Router()

// userRouter.post('/signup',
// multer_local({custom_types:[...multer_enum.image]}).fields({
//     {name:"attachments",maxCount:1},
//     {name:"attachments",maxCount:2},
// }),
//     US.signUp
//     )
// Validation(UV.signUpSchema),
userRouter.post('/signup/gmail',US.signUpWithGmail)

userRouter.post('/signin',multer_local({path:"users/admin",type:[...fileTypeEnum.image,...fileTypeEnum.pdf]}).single("attachment"),US.signIn)
userRouter.get('/profile',authentication,authorization([RoleEnum.user]),US.getProfile)

export default userRouter
