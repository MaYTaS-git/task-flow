"use client";

import { redirect } from "next/navigation";
import React from "react";

const Page: React.FC = () => {
	redirect("/portal/dashboard");
};

export default Page;
