"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.signInSchema = void 0;
const zod_1 = require("zod");
exports.signInSchema = zod_1.z.object({
    email: zod_1.z.string({
        invalid_type_error: "Please enter a valid email."
    })
        .email("Please enter a valid email.")
        .min(5, "Email should be at least 5 characters."),
    password: zod_1.z.string({
        invalid_type_error: "Please enter a valid password."
    }).min(6, "Password should be at least 6 characters.")
});
exports.signUpSchema = zod_1.z.object({
    email: zod_1.z.string({
        invalid_type_error: "Please enter a valid email."
    })
        .email("Please enter a valid email.")
        .min(5, "Email should be at least 5 characters."),
    name: zod_1.z.string({
        invalid_type_error: "Please enter a valid name."
    }).min(2, "Name should be at least 2 characters."),
    password: zod_1.z.string({
        invalid_type_error: "Please enter a valid password."
    }).min(6, "Password should be at least 6 characters.")
});
