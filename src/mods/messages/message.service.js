import messageModel from "../../DB/Models/messages.model.js";
import userModel from "../../DB/Models/user.model.js";
import * as DBS from "../../DB/db.service.js";
import { successResponse } from "../../common/utils/response.succ.js";

export const sendMessage = async (req, res, next) => {
  const { content, userId } = req.body;

  const user = await DBS.findone({
    model: userModel,
    filter: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("user Does Not exist");
  }
  let arr = [];
  if (req.files.length) {
    for (const file of req.files) {
      arr.push(file.path);
    }
  }
  const message = await DBS.create({
    model: messageModel,
    data: {
      content,
      userId: user._id,
      attachments: arr,
    },
  });
  successResponse({ res, status: 201, data: message });
};
export const getMessage = async (req, res, next) => {
    const { messageId } = req.params;
  
    const message = await DBS.findone({
      model: messageModel,
      filter:{
        _id:messageId,
        userId:req.user._id
      }
    });
    if(!message){
        throw new Error("Message Does Not Exist")
    }
    successResponse({ res, status: 201, data: message });
  };
  export const getMessages = async (req, res, next) => {
    const { messageId } = req.params;
  
    const messages = await DBS.find({
      model: messageModel,
      filter:{
        userId:req.params.userId
      }
    });
    if(!messages){
        throw new Error("Message Does Not Exist")
    }
    successResponse({ res, status: 201, data: messages });
  };
