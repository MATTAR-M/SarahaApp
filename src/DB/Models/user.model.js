import mongoose from "mongoose";
import { genderEnum,providerEnum } from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password : {
        type:String,
        required : true,
        minLength:8,
        trim:true
    },
    phone:{
      type :String,
      required:true,
    },
    age : Number,
    gender:{
        type : String,
        enum:Object.values(genderEnum),
        default : genderEnum.male
    },
    profilePicture : String,
    confirmed : Boolean,
    provider:{
        type : String,
        enum:Object.values(providerEnum),
        default : providerEnum.system
    }
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON:true
  }
);
userSchema.virtual("userName")
.get(function (){
    return this.firstName+" "+this.lastName
})
.set(function(v){
    const [firstName,lastName] = v.split(" ")
    this.set({firstName,lastName})
})
const userModel = mongoose.models.user || mongoose.model("user",userSchema)

export default userModel
