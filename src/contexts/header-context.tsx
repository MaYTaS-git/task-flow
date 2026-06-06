"use client";

import React, { createContext, useContext, useState } from "react";

type HeaderData = {
	title: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
};

const HeaderDataContext = createContext<HeaderData | null>(null);
const HeaderSetDataContext = createContext<((data: HeaderData | null) => void) | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
	const [headerData, setHeaderData] = useState<HeaderData | null>(null);

	return (
		<HeaderDataContext.Provider value={headerData}>
			<HeaderSetDataContext.Provider value={setHeaderData}>
				{children}
			</HeaderSetDataContext.Provider>
		</HeaderDataContext.Provider>
	);
}

export function useHeader() {
	const headerData = useContext(HeaderDataContext);
	const setHeaderData = useContext(HeaderSetDataContext);
	if (!setHeaderData) {
		throw new Error("useHeader must be used within a HeaderProvider");
	}
	return { headerData, setHeaderData };
}

export function useSetHeader() {
	const setHeaderData = useContext(HeaderSetDataContext);
	if (!setHeaderData) {
		throw new Error("useSetHeader must be used within a HeaderProvider");
	}
	return setHeaderData;
}
