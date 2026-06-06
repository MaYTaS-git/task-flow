"use client";

import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	const orig = console.error;
	console.error = (...args: unknown[]) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Encountered a script tag")
		) {
			return;
		}
		orig.apply(console, args);
	};
}

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						retry: false,
					},
				},
			}),
	);

	return (
		<TooltipProvider>
			<SessionProvider>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
					>
						{children}
					</ThemeProvider>
				</QueryClientProvider>
			</SessionProvider>
		</TooltipProvider>
	);
}
