import express from 'express'
import userModel from './DB/Models/user.model.js'
import checkConnection from './DB/connectionDB.js'
import userRouter from './mods/users/user.contorller.js'
import cors from 'cors'
import { Port } from '../config/config.service.js'
const app = express()
const port = Port

const bootstrap = ()=>{
    app.use(cors({origin : "*"}),express.json())
    checkConnection()
    userModel
    app.use('/users',userRouter)
    app.get('/', (req, res) => res.send('Hello World!'))
    app.use('{/*demo}',(req,res,next)=>{
        // res.status(404).json({message:`URL ${req.originalUrl} not found`})
        throw new Error(`URL ${req.originalUrl} not found`,{cause:404})
    })
    app.use((err, req, res, next) => {
        res.status(err.cause||500).json({message:err.message,stack:err.stack})
    })
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}

export default bootstrap