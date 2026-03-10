import multer from "multer";
import fs from "node:fs"

export const multer_local = ({path:customPath="General",type:fileType=[]}=[])=>{
const fullPath = `matar/${customPath}`
if(!fs.existsSync(fullPath)){
  fs.mkdirSync(fullPath,{recursive:true})
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  })
  function fileFilter (req, file, cb) {
    if(!fileType.includes(file.mimetype)){
      cb(new Error("inValid Type"))
    }
    cb(null,true  )
  }
  const upload = multer({ storage,fileFilter })
  return upload
}
