import { Type } from "@sinclair/typebox";
import { SetErrorFunction, DefaultErrorFunction } from "@sinclair/typebox/errors";

// Set global custom error handler to resolve custom messages
SetErrorFunction((error) => {
	if (error.schema.message && typeof error.schema.message === "string") {
		return error.schema.message;
	}
	return DefaultErrorFunction(error);
});

export const RegisterSchema = Type.Object({
	name: Type.String({ minLength: 1, message: "Name is required" }),
	email: Type.String({ format: "email", message: "Invalid email address" }),
	password: Type.String({ minLength: 6, message: "Password must be at least 6 characters" }),
});

export const LoginSchema = Type.Object({
	email: Type.String({ format: "email", message: "Invalid email address" }),
	password: Type.String({ minLength: 6, message: "Password must be at least 6 characters" }),
});
