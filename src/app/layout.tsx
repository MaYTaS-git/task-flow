import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/contexts/providers";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME, APP_SLOGAN, APP_DESCRIPTION } from "@/constants/config";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: `${APP_NAME} | ${APP_SLOGAN}`,
	description: APP_DESCRIPTION,
	keywords: ["task", "manager", APP_NAME, "task manager", "taskflow"],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"h-full",
				"antialiased",
				plusJakarta.variable,
				outfit.variable,
				geistMono.variable,
				"font-sans",
			)}
		>
			<body className="min-h-full flex flex-col">
				<Providers>{children}</Providers>
				<Toaster />
			</body>
		</html>
	);
}
