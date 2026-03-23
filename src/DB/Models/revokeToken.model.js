import mongoose from "mongoose";
import { genderEnum,providerEnum ,RoleEnum} from "../../common/enum/user.enum.js";

const revokeTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    }, 
  },
  {
    timestamps: true,
    strictQuery: true,
  }
);
revokeTokenSchema.index({expiresAt:1},{expireAfterSeconds:0})
const revokeTokenModel = mongoose.models.revokeToken || mongoose.model("revokeToken",revokeTokenSchema)

export default revokeTokenModel
