"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieSchema = exports.signUpSchema = exports.signInSchema = void 0;
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
exports.movieSchema = zod_1.z.object({
    description: zod_1.z.string().min(10, "Description must be at least 10 characters."),
    duration: zod_1.z.number().int().positive("Provide a valid duration."),
    genres: zod_1.z.array(zod_1.z.string()).min(1, "Provide at least 1 genre."),
    releaseDate: zod_1.z.coerce.date(),
    slug: zod_1.z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    title: zod_1.z.string().min(1, "Title must be at least 1 character.")
});
