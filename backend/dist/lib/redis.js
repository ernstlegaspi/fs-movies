"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initClient = void 0;
const redis_1 = require("redis");
let client = null;
const initClient = async () => {
    if (!client) {
        try {
            const tempClient = (0, redis_1.createClient)();
            tempClient.on("connect", () => console.log("Connected"));
            tempClient.on("error", e => console.log("Error connecting: " + e));
            await tempClient.connect();
            client = tempClient;
        }
        catch (e) {
            console.error("Failed to connect Redis client:", e);
            throw e;
        }
        console.log("if");
    }
    console.log("else");
    return client;
};
exports.initClient = initClient;
