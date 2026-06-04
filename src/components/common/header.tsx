"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ThemeSelector } from "./theme-selector";
import { Button } from "@/components/ui/button";

export function Header() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = (event: Event) => {
			const target = event.target;
			let scrollTop = 0;
			if (target instanceof HTMLElement) {
				scrollTop = target.scrollTop;
			} else if (target instanceof Document) {
				scrollTop = window.scrollY || document.documentElement.scrollTop;
			}
			setScrolled(scrollTop > 10);
		};

		// Capture scroll events in the capture phase to detect scrolling inside custom ScrollArea viewports
		document.addEventListener("scroll", handleScroll, true);
		return () => document.removeEventListener("scroll", handleScroll, true);
	}, []);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
				scrolled
					? "bg-white/80 border-b border-black/5 dark:bg-neutral-950/80 dark:border-white/5 backdrop-blur-md shadow-lg"
					: "bg-transparent border-b border-transparent"
			}`}
		>
			<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
					<div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
						<Image
							src="/icons/apple-touch-icon.png"
							alt="TaskFlow Logo"
							width={22}
							height={22}
							className="object-contain"
						/>
					</div>
					<span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white/95">
						TaskFlow
					</span>
				</Link>
				<div className="flex items-center gap-3">
					<Button
						nativeButton={false}
						render={<Link href="/login" />}
						size="lg"
					>
						Get Started
						<ArrowRight className="size-3.5" />
					</Button>

					<ThemeSelector />
				</div>
			</div>
		</header>
	);
}
