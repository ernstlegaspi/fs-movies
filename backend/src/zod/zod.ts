import { z } from "zod"

export const signInSchema = z.object({
	email: z.string({
		invalid_type_error: "Please enter a valid email."
	})
	.email("Please enter a valid email.")
	.min(5, "Email should be at least 5 characters."),

	password: z.string({
		invalid_type_error: "Please enter a valid password."
	}).min(6, "Password should be at least 6 characters.")
})

export const signUpSchema = z.object({
	email: z.string({
		invalid_type_error: "Please enter a valid email."
	})
	.email("Please enter a valid email.")
	.min(5, "Email should be at least 5 characters."),

	name: z.string({
		invalid_type_error: "Please enter a valid name."
	}).min(2, "Name should be at least 2 characters."),

	password: z.string({
		invalid_type_error: "Please enter a valid password."
	}).min(6, "Password should be at least 6 characters.")
})
