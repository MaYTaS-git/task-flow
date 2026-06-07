"use client";

import React, { useEffect } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSetHeader } from "@/contexts/header-context";

export default function UnauthorizedPage() {
	const setHeaderData = useSetHeader();

	useEffect(() => {
		setHeaderData({
			title: "Access Denied",
			description: "You do not have the required permissions to view this resource.",
		});
		return () => setHeaderData(null);
	}, [setHeaderData]);

	return (
		<div className="flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-md mx-auto py-20">
			<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-full text-destructive animate-breathe">
				<ShieldAlert className="size-12" />
			</div>
			<div className="space-y-2 animate-fade-in-up">
				<h2 className="text-2xl font-bold tracking-tight">
					Unauthorized Access
				</h2>
				<p className="text-sm text-muted-foreground font-light leading-relaxed">
					Your role inside this organization does not have sufficient clearance to access this module. Please contact your organization administrator to request access.
				</p>
			</div>
			<Button size="lg" className="animate-fade-in-up" render={<Link href="/portal/dashboard" />}>
				<ArrowLeft className="size-4 mr-2" />
				Back to Dashboard
			</Button>
		</div>
	);
}
