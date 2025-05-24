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

export const movieSchema = z.object({
	description: z.string().min(10, "Description must be at least 10 characters."),
	duration: z.number().int().positive("Provide a valid duration."),
	genres: z.array(z.string()).min(1, "Provide at least 1 genre."),
	releaseDate: z.coerce.date(),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
	title: z.string().min(1, "Title must be at least 1 character.")
})
