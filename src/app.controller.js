import express from "express";
import userModel from "./DB/Models/user.model.js";
import checkConnection from "./DB/connectionDB.js";
import userRouter from "./mods/users/user.contorller.js";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import { Port, WHITELIST } from "../config/config.service.js";
import { redis_Connection, redis_Client } from "./DB/redis/redis.connection.js";
import messageRouter from "./mods/messages/message.controller.js";
import helmet from "helmet";
const app = express();
const port = Port;

const bootstrap = async () => {
  const corsOptions = {
    origin: function (origin, callback) {
      if ([...WHITELIST, undefined].includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not Allowed By CORS"));
      }
    },
  };
  app.use(helmet(),cors(corsOptions), express.json());
  checkConnection();
  await redis_Connection();
  // await redis_Client.set("name","SarahaApp")
  // const data = await redis_Client.get("name")
  // await redis_Client.del("name")
  // console.log(data)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests", status: 429 },
  });
  app.use(generalLimiter);
  app.use("/uploads", express.static("matar"));
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);
  app.use(generalLimiter);
  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("{/*demo}", (req, res, next) => {
    // res.status(404).json({message:`URL ${req.originalUrl} not found`})
    throw new Error(`URL ${req.originalUrl} not found`, { cause: 404 });
  });
  app.use((err, req, res, next) => {
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};

export default bootstrap;
