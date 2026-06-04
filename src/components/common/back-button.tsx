"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
	const router = useRouter();

	return (
		<Button
			onClick={() => router.back()}
			variant="ghost"
			size="sm"
			className="mb-2 gap-2"
		>
			<ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
			Back
		</Button>
	);
}
