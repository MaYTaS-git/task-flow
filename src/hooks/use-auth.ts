import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { RegisterInput } from "@/types/auth.types";

export function useRegister() {
	return useMutation({
		mutationFn: async (input: RegisterInput) => {
			// Call the Elysia Eden Treaty API
			const { data, error } = await api.register.post(input);

			if (error) {
				// Parse custom server errors matching { success: false, message }
				const errMsg =
					(error.value as { message?: string })?.message ||
					"Registration failed. Please try again.";
				throw new Error(errMsg);
			}

			return data;
		},
	});
}
