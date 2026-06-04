"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Footer() {
	return (
		<footer className="relative z-40 border-t border-neutral-200 bg-neutral-50 dark:border-white/5 dark:bg-neutral-950 py-12">
			<div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
				<div className="flex items-center gap-2.5 select-none">
					<Image
						src="/icons/apple-touch-icon.png"
						alt="TaskFlow Logo"
						width={16}
						height={16}
						className="object-contain grayscale opacity-50"
					/>
					<span className="font-semibold text-neutral-600 dark:text-neutral-400">
						TaskFlow
					</span>
					<span>
						&copy; {new Date().getFullYear()} MaYTaS. All rights reserved.
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						render={<Link href="/terms" />}
						nativeButton={false}
						variant="link"
						size="sm"
					>
						Terms of Service
					</Button>
					<Button
						render={<Link href="/privacy" />}
						nativeButton={false}
						variant="link"
						size="sm"
					>
						Privacy Policy
					</Button>
				</div>
			</div>
		</footer>
	);
}
