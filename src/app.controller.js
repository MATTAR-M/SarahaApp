import express from 'express'
import userModel from './DB/Models/user.model.js'
import checkConnection from './DB/connectionDB.js'
import userRouter from './mods/users/user.contorller.js'
import cors from 'cors'
import { Port } from '../config/config.service.js'
import { redis_Connection, redis_Client } from './DB/redis/redis.connection.js'
const app = express()
const port = Port

const bootstrap = async ()=>{
    app.use(cors({origin : "*"}),express.json())
    checkConnection()
    await redis_Connection()
    // await redis_Client.set("name","SarahaApp")
    // const data = await redis_Client.get("name")
    // await redis_Client.del("name")
    // console.log(data)

    userModel
    app.use("/uploads",express.static("matar"))
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