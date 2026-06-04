import { Static } from "@sinclair/typebox";
import { RegisterSchema, LoginSchema } from "@/schemas/auth.schema";

export type RegisterInput = Static<typeof RegisterSchema>;
export type LoginInput = Static<typeof LoginSchema>;

export type ApiResponse<T> =
	| { success: true; data: T }
	| { success: false; message: string };
