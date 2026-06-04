import { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
	title: "Sign In - TaskFlow",
	description: "Sign in to your account to manage your projects, tasks, and team productivity with TaskFlow.",
};

export default function LoginPage() {
	return <LoginForm />;
}

