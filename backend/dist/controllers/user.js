"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = exports.signIn = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const zod_1 = require("../zod/zod");
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = zod_1.signInSchema.safeParse({ email, password });
        const s = req.session;
        if (result.error) {
            const err = result.error.flatten().fieldErrors;
            res.status(400).json({ error: err.email?.[0] || err.password?.[0] || "Invalid Request" });
            return;
        }
        const existingUser = await db_1.pool.query(`SELECT email, name, password FROM  users where email = $1`, [email]);
        if (existingUser.rowCount === 0) {
            res.status(400).json({ error: "No email detected. Please sign up first." });
            return;
        }
        const user = existingUser.rows[0];
        const isPasswordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ error: "User not existing." });
            return;
        }
        s.user = { success: true };
        res.status(201).json({ data: { email: user.email } });
    }
    catch (e) {
        console.log("Sign up error");
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.signIn = signIn;
const signUp = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const result = zod_1.signUpSchema.safeParse({ email, name, password });
        const s = req.session;
        if (result.error) {
            const err = result.error.flatten().fieldErrors;
            res.status(400).json({ error: err.email?.[0] || err.name?.[0] || err.password?.[0] || "Invalid Request" });
            return;
        }
        const existingUser = await db_1.pool.query(`SELECT email FROM  users where email = $1`, [email]);
        if (existingUser.rowCount !== 0) {
            res.status(409).json({ error: "Email is already existing." });
            return;
        }
        const hashPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await db_1.pool.query(`INSERT INTO users (email, name, password)
			VALUES ($1, $2, $3) RETURNING email, name, password`, [email, name, hashPassword]);
        const user = newUser.rows[0];
        s.user = { success: true };
        res.status(201).json({ data: { email: user.email } });
    }
    catch (e) {
        console.log("Sign up error");
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.signUp = signUp;
