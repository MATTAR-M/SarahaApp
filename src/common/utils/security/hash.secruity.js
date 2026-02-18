import { hashSync,compareSync } from "bcrypt"

export const Hash = ({plainText,salt_rounds = process.env.SALT_ROUND}={})=>{
    return hashSync(plainText,Number(process.env.SALT_ROUND))
}
export const Compare = ({plainText,cipherText}={})=>{
    return compareSync(plainText,cipherText)
}