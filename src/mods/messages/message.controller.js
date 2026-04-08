import { Router } from "express";
import * as MS from "./message.service.js";
import * as MV from "./message.validation.js";
import { multer_local } from "../../common/middleware/multer.js";
import { Validation } from "../../common/middleware/validators.js";
import { fileTypeEnum } from "../../common/enum/Multer.enum.js";
import { authentication } from "../../common/middleware/authentication.js";
const messageRouter = Router();

messageRouter.post(
  "/send",
  multer_local({
    path: "messages",
    type: fileTypeEnum.image,
  }).array("attachments", 3),
  Validation(MV.sendMessageSchema),
  MS.sendMessage
);

messageRouter.get(
  "/:messageId",
  authentication,
  Validation(MV.getMessageSchema),
  MS.getMessage
);
messageRouter.get(
    "/",
    authentication,
    MS.getMessages
    
  );
export default messageRouter;
