"use client";

import React, { createContext, useContext } from "react";
import { Session } from "next-auth";

export interface UserSessionContextType {
	session: Session & { user: { id: string } };
}

const SessionContext = createContext<UserSessionContextType | null>(null);

export function SessionProvider({
	children,
	session,
}: {
	children: React.ReactNode;
	session: Session;
}) {
	return (
		<SessionContext.Provider value={{ session: session as Session & { user: { id: string } } }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useUserSession() {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useUserSession must be used within a SessionProvider");
	}
	return context.session;
}
