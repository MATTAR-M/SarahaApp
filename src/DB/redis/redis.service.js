import { emailEventEnum } from "../../common/enum/email.enum.js";
import { redis_Client } from "./redis.connection.js";

export const revoked_key = ({ userId, jti }) => {
  return `revokeToken::${userId}::${jti}`;
};
export const get_Key = ({ userId }) => {
  return `revokeToken::${userId}`;
};

export const setValue = async ({ key, value, ttl }) => {
  try {
    const data = typeof value === "string" ? value : JSON.stringify(value);
    return ttl
      ? await redis_Client.set(key, data, { EX: ttl })
      : await redis_Client.set(key, data);
  } catch (error) {
    console.log(error, "failed to set value in redis");
  }
};

export const update = async ({ key, value, ttl }) => {
  try {
    return await setValue({ key, value, ttl });
  } catch (error) {
    console.log(error, "failed to update value in redis");
  }
};

export const getValue = async ({ key }) => {
  try {
    try {
      return JSON.parse(await redis_Client.get(key));
    } catch (error) {
      return await redis_Client.get(key);
    }
  } catch (error) {
    console.log(error, "failed to get value in redis");
  }
};

export const ttl = async ({ key }) => {
  try {
    return await redis_Client.ttl(key);
  } catch (error) {
    console.log(error, "failed to get ttl value in redis");
  }
};

export const exsit = async ({ key }) => {
  try {
    return await redis_Client.exists(key);
  } catch (error) {
    console.log(error, "failed to get exsit value in redis");
  }
};

export const deleteKey = async ({ key }) => {
  try {
    if (!key.length) return 0;
    return await redis_Client.del(key);
  } catch (error) {
    console.log(error, "failed to delete value in redis");
  }
};

export const key = async (pattern) => {
  try {
    return await redis_Client.keys(pattern);
  } catch (error) {
    console.log(error, "failed to get keys in redis");
  }
};

export const incr = async (key) => {
  try {
    return await redis_Client.incr(key);
  } catch (error) {
    console.log(error, "failed to increment in redis");
  }
};

export const otpKey = ({ email,subject=emailEventEnum.confiemEmail }) => {
  return `otp::${email}::${subject}`;
};
export const max_OtpKey = ({ email }) => {
  return `${otpKey({ email })}::otpCount`;
};
export const block_OtpKey = ({ email }) => {
  return `${otpKey({ email })}::Bloced`;
};
