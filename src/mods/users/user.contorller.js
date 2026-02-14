import { Router } from "express";
import * as US from './user.service.js'

const userRouter = Router()

userRouter.post('/signup',US.signUp)
userRouter.post('/signin',US.signIn)
userRouter.get('/profile/:id',US.getProfile)

export default userRouter