"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { redirect } from "next/navigation";

import { SessionProvider } from "@/contexts/session-context";

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { data: session, status } = useSession();

	if (status == "loading") {
		return (
			<div className="size-full flex items-center justify-center">
				<Spinner className="size-10" />
			</div>
		);
	}

	if (status == "unauthenticated" || !session) {
		redirect("/login");
	}

	return (
		<SessionProvider session={session}>
			{children}
		</SessionProvider>
	);
};

export default Layout;
