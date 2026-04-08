import { EventEmitter } from "node:events";
import { emailEventEnum } from "../../enum/email.enum.js";
const eventemitter = new EventEmitter();
eventemitter.on(emailEventEnum.confiemEmail, async (fn) => {
    await fn()
})
export default eventemitter;   