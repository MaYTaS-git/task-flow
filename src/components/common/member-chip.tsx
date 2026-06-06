"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberChipProps {
	name: string | null;
	email: string;
	active?: boolean;
	onClick?: () => void;
	className?: string;
	size?: "sm" | "default";
}

function getInitials(name: string | null, email: string): string {
	if (name) {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	}
	return email.substring(0, 2).toUpperCase();
}

export function MemberChip({ name, email, active, onClick, className, size = "default" }: MemberChipProps) {
	const initials = getInitials(name, email);
	const displayName = name || email;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border transition-all duration-150 cursor-pointer select-none",
				size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
				active
					? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10 scale-[1.02]"
					: "border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground",
				className,
			)}
			title={displayName}
		>
			<span
				className={cn(
					"rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0",
					size === "sm" ? "size-4 text-[9px]" : "size-5 text-[10px]",
				)}
			>
				{initials}
			</span>
			<span className="truncate max-w-[100px] font-medium">
				{displayName}
			</span>
		</button>
	);
}

// Avatar-only variant (for display in task cards, headers, etc.)
interface MemberAvatarProps {
	name: string | null;
	email: string;
	size?: "xs" | "sm" | "default";
	className?: string;
}

export function MemberAvatar({ name, email, size = "default", className }: MemberAvatarProps) {
	const initials = getInitials(name, email);
	const sizeClass = size === "xs" ? "size-5 text-[8px]" : size === "sm" ? "size-6 text-[9px]" : "size-7 text-[10px]";

	return (
		<Avatar className={cn(sizeClass, className)} title={name || email}>
			<AvatarFallback className="bg-muted text-muted-foreground font-bold border border-border">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}

export { getInitials };
