import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
const checkConnection = async () => {
  await mongoose
    .connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("DB connection has been established🫡 🫡");
    })
    .catch((error) => {
      console.log("Failed to connect to DB🤷‍♂️  🤷‍♂️", error);
    });
};
export default checkConnection;
