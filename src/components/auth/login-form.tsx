"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowRight,
	Loader2,
	Eye,
	EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
	InputGroupButton,
} from "@/components/ui/input-group";
import { ThemeSelector } from "@/components/common/theme-selector";

import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import type { RegisterInput, LoginInput } from "@/types/auth.types";
import { useRegister } from "@/hooks/use-auth";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LoginForm() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	// 'login' or 'signup' mode
	const [mode, setMode] = useState<"login" | "signup">("login");

	// Other controlled states not in typebox schemas
	const [rememberMe, setRememberMe] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);

	const [showPassword, setShowPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);

	// React Hook Form for Login
	const {
		register: registerLogin,
		handleSubmit: handleLoginSubmit,
		formState: { errors: loginErrors },
		reset: resetLoginForm,
	} = useForm<LoginInput>({
		resolver: typeboxResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// React Hook Form for Register
	const {
		register: registerSignup,
		handleSubmit: handleSignupSubmit,
		formState: { errors: signupErrors },
		reset: resetSignupForm,
	} = useForm<RegisterInput>({
		resolver: typeboxResolver(RegisterSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	// Register query mutation
	const registerMutation = useRegister();

	// Prevent hydration mismatch
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	const switchMode = (newMode: "login" | "signup") => {
		resetLoginForm();
		resetSignupForm();
		setRememberMe(false);
		setAcceptTerms(false);
		setMode(newMode);
	};

	const onLoginSubmit = async (data: LoginInput) => {
		setIsSubmitting(true);
		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				rememberMe: rememberMe ? "true" : "false",
				redirect: false,
			});

			if (result?.error) {
				toast.error("Invalid email or password. Please try again.");
			} else {
				toast.success("Welcome back! Redirecting...");
				router.push("/portal/dashboard");
				router.refresh();
			}
		} catch (err) {
			console.error("Login submission error:", err);
			toast.error(
				"An unexpected error occurred. Please try again later.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSignupSubmit = async (data: RegisterInput) => {
		if (!acceptTerms) {
			toast.error("You must accept the terms and conditions.");
			return;
		}

		setIsSubmitting(true);
		registerMutation.mutate(
			{ name: data.name, email: data.email, password: data.password },
			{
				onSuccess: async () => {
					toast.success(
						"Account created successfully! Logging you in...",
					);
					try {
						// Auto sign-in
						const result = await signIn("credentials", {
							email: data.email,
							password: data.password,
							redirect: false,
						});
						if (result?.error) {
							toast.info(
								"Registration successful. Please sign in.",
							);
							switchMode("login");
						} else {
							router.push("/portal/dashboard");
							router.refresh();
						}
					} catch (err) {
						console.error("Auto login error:", err);
						switchMode("login");
					} finally {
						setIsSubmitting(false);
					}
				},
				onError: (err: Error) => {
					toast.error(err.message || "Failed to create account.");
					setIsSubmitting(false);
				},
			},
		);
	};

	const handleSocialLogin = async (provider: string) => {
		setIsSubmitting(true);
		try {
			await signIn(provider, { callbackUrl: "/portal/dashboard" });
		} catch (err) {
			console.error("Social login error:", err);
			toast.error(`Could not sign in with ${provider}.`);
			setIsSubmitting(false);
		}
	};

	if (!mounted) return null;

	const loadingState = isSubmitting || registerMutation.isPending;

	return (
		<div className="h-screen w-full flex bg-background font-sans overflow-hidden relative">
			{/* Floating Theme Toggle in Top Right */}
			<div className="absolute top-6 right-6 z-50">
				<ThemeSelector className="size-10" />
			</div>

			{/* Left side static anchor for Form Panel (Sign-up layout) or Hero Panel (Login layout) */}
			<div className="w-full h-full flex relative">
				{/* ================= HERO PANEL ================= */}
				<motion.div
					className="hidden md:flex md:w-1/2 h-full absolute top-0 bottom-0 z-30 bg-neutral-950 items-center justify-center p-12 text-white overflow-hidden"
					animate={{
						x: mode === "login" ? "0%" : "100%",
					}}
					transition={{ type: "spring", stiffness: 80, damping: 17 }}
				>
					{/* Glowing backgrounds */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.35_0.18_280)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.4_0.16_320)_0%,transparent_50%)] opacity-70 mix-blend-screen pointer-events-none" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.25_0.15_200)_0%,transparent_60%)] opacity-80 pointer-events-none" />

					{/* Ambient animated floating elements */}
					<motion.div
						className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none"
						animate={{
							scale: [1, 1.1, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 10,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<motion.div
						className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-secondary/15 blur-[120px] pointer-events-none"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.4, 0.6, 0.4],
						}}
						transition={{
							duration: 7,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					<div className="relative z-10 max-w-lg flex flex-col justify-between h-full">
						{/* Logo */}
						<div className="flex items-center gap-2 group cursor-default">
							<div className="p-2 bg-white/10 rounded-md backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
								<Image
									height={50}
									width={50}
									src="/icons/apple-touch-icon.png"
									alt="TaskFlow Logo"
									className="size-6 object-contain"
								/>
							</div>
							<span className="text-xl font-bold tracking-tight text-white/95">
								TaskFlow
							</span>
						</div>

						{/* Content switches depending on mode */}
						<AnimatePresence mode="wait">
							<motion.div
								key={mode}
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -15 }}
								transition={{ duration: 0.4 }}
								className="space-y-6 my-auto"
							>
								<h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight bg-linear-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
									{mode === "login"
										? "Manage your projects with absolute clarity."
										: "Start organizing your productivity today."}
								</h1>
								<p className="text-lg text-neutral-400 font-light leading-relaxed">
									{mode === "login"
										? "Unite your team, streamline your workflows, and track every task from conception to completion with our beautiful workspace."
										: "Join thousands of builders, designers, and managers using TaskFlow to ship products faster and structure daily schedules."}
								</p>
							</motion.div>
						</AnimatePresence>

						{/* Testimonial Quote */}
						<div className="p-6 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
							<p className="text-sm text-neutral-300 italic">
								&ldquo;
								{mode === "login"
									? "This task manager has completely transformed how our engineering team ships updates. The speed and clarity are unmatched."
									: "Setting up my account took seconds, and the clean multi-theme workspace immediately boosted my focus."}
								&rdquo;
							</p>
							<div className="mt-4 flex items-center gap-3">
								<div className="size-8 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
									{mode === "login" ? "JD" : "AS"}
								</div>
								<div>
									<div className="text-xs font-semibold text-neutral-200">
										{mode === "login"
											? "Jane Doe"
											: "Alex Smith"}
									</div>
									<div className="text-[10px] text-neutral-400">
										{mode === "login"
											? "Lead Tech Architect"
											: "Freelance Designer"}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ================= FORMS PANEL LAYOUTS ================= */}
				{/* 1. LOGIN FORM PANEL (Placed on Right, slides out to right when inactive) */}
				<motion.div
					className="w-full md:w-1/2 h-full absolute top-0 bottom-0 right-0 flex flex-col bg-background overflow-hidden"
					initial={false}
					animate={{
						x: mode === "login" ? "0%" : "100%",
						opacity: mode === "login" ? 1 : 0,
						pointerEvents: mode === "login" ? "auto" : "none",
					}}
					transition={{ type: "spring", stiffness: 80, damping: 17 }}
				>
					<ScrollArea className="w-full h-full">
						<div className="min-h-full w-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
							<div className="w-full max-w-md space-y-6 relative z-10 py-8">
						{/* Mobile Brand Logo */}
						<div className="flex md:hidden items-center justify-center gap-2 mb-2">
							<div className="p-2 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
								<Image
									height={50}
									width={50}
									src="/icons/apple-touch-icon.png"
									alt="TaskFlow"
									className="size-6 object-contain"
								/>
							</div>
							<span className="text-xl font-bold tracking-tight text-foreground">
								TaskFlow
							</span>
						</div>

						<div className="text-center md:text-left space-y-2">
							<h2 className="text-3xl font-extrabold tracking-tight">
								Welcome Back
							</h2>
							<p className="text-sm text-muted-foreground">
								Enter your credentials below to access your
								workspace
							</p>
						</div>

						<form
							onSubmit={handleLoginSubmit(onLoginSubmit)}
							className="space-y-4"
						>
							<div className="space-y-4">
								<Field className="space-y-1.5">
									<FieldLabel htmlFor="login-email">
										Email Address
									</FieldLabel>
									<Input
										id="login-email"
										type="email"
										placeholder="name@example.com"
										{...registerLogin("email")}
										disabled={loadingState}
										className="w-full border-border focus:border-primary"
										aria-invalid={!!loginErrors.email}
									/>
									{loginErrors.email && (
										<FieldError>{loginErrors.email.message}</FieldError>
									)}
								</Field>

								<Field className="space-y-1.5">
									<FieldLabel htmlFor="login-password">
										Password
									</FieldLabel>
									<InputGroup className="w-full border-border">
										<InputGroupInput
											id="login-password"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="••••••••"
											{...registerLogin("password")}
											disabled={loadingState}
											aria-invalid={!!loginErrors.password}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												onClick={() =>
													setShowPassword(
														!showPassword,
													)
												}
												disabled={loadingState}
												title={
													showPassword
														? "Hide password"
														: "Show password"
												}
											>
												{showPassword ? (
													<EyeOff className="size-3.5" />
												) : (
													<Eye className="size-3.5" />
												)}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									{loginErrors.password && (
										<FieldError>{loginErrors.password.message}</FieldError>
									)}
								</Field>
							</div>

							<div className="flex items-center space-x-2 py-1">
								<Checkbox
									id="remember"
									checked={rememberMe}
									onCheckedChange={(checked) =>
										setRememberMe(!!checked)
									}
									disabled={loadingState}
								/>
								<label
									htmlFor="remember"
									className="text-sm font-medium leading-none cursor-pointer select-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Remember me for 30 days
								</label>
							</div>

							<Button
								type="submit"
								disabled={loadingState}
								className="w-full"
							>
								{loadingState ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<>
										Sign In with Email
										<ArrowRight className="size-4" />
									</>
								)}
							</Button>

							<div className="relative flex items-center justify-center my-4">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-border" />
								</div>
								<span className="relative px-3 bg-background text-xs uppercase text-muted-foreground font-medium">
									Or continue with
								</span>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<Button
									type="button"
									variant="outline"
									disabled={loadingState}
									onClick={() => handleSocialLogin("google")}
									className="w-full"
								>
									<svg
										className="size-4"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 488 512"
									>
										<path
											fill="currentColor"
											d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
										/>
									</svg>
								</Button>
								<Button
									type="button"
									variant="outline"
									disabled={loadingState}
									onClick={() => handleSocialLogin("github")}
									className="w-full"
								>
									<svg
										className="size-4"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 496 512"
									>
										<path
											fill="currentColor"
											d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.5 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5.7 1.3-1.6.7-4.6-1.3-6.2-2.2-2.3-5.2-2.6-6.5-.7zm-14.4-18c-.3 1.6 1 3.6 3.3 4.3 2 .7 4.3-.3 4.9-2 .3-1.6-1-3.6-3.3-4.3-2-.7-4.3.3-4.9 2z"
										/>
									</svg>
								</Button>
								<Button
									type="button"
									variant="outline"
									disabled={loadingState}
									onClick={() => handleSocialLogin("discord")}
									className="w-full"
								>
									<svg
										className="size-4"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 640 512"
									>
										<path
											fill="currentColor"
											d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.9,485.9,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.131a1.712,1.712,0,0,0-.788.676C39.1,183.651,18.2,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676,348.2,348.2,0,0,0,31.29-51.067,1.853,1.853,0,0,0-1.016-2.583,319.624,319.624,0,0,1-45.962-21.884,1.875,1.875,0,0,1-.185-3.12c3.109-2.336,6.217-4.764,9.135-7.234a1.808,1.808,0,0,1,1.887-.255c91.139,41.67,190.22,41.67,280.235,0a1.8,1.8,0,0,1,1.909.243c2.919,2.481,6.027,4.9,9.136,7.246a1.882,1.882,0,0,1-.173,3.119,301.407,301.407,0,0,1-45.973,21.884,1.857,1.857,0,0,0-1.016,2.6,378.188,378.188,0,0,0,31.278,51.055,1.925,1.925,0,0,0,2.075.688A486.077,486.077,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,602.13,167.436,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.923,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
										/>
									</svg>
								</Button>
							</div>
						</form>

						<div className="text-center text-sm text-muted-foreground mt-2">
							New to TaskFlow?{" "}
							<button
								type="button"
								onClick={() => switchMode("signup")}
								className="text-primary hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 inline-block"
							>
								Create an account
							</button>
						</div>
					</div>
						</div>
					</ScrollArea>
				</motion.div>

				{/* 2. SIGN-UP FORM PANEL (Placed on Left, slides out to left when inactive) */}
				<motion.div
					className="w-full md:w-1/2 h-full absolute top-0 bottom-0 left-0 flex flex-col bg-background overflow-hidden"
					initial={false}
					animate={{
						x: mode === "signup" ? "0%" : "-100%",
						opacity: mode === "signup" ? 1 : 0,
						pointerEvents: mode === "signup" ? "auto" : "none",
					}}
					transition={{ type: "spring", stiffness: 80, damping: 17 }}
				>
					<ScrollArea className="w-full h-full">
						<div className="min-h-full w-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
							<div className="w-full max-w-md space-y-5 relative z-10 py-8">
						{/* Mobile Brand Logo */}
						<div className="flex md:hidden items-center justify-center gap-2 mb-2">
							<div className="p-2 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
								<Image
									height={50}
									width={50}
									src="/icons/apple-touch-icon.png"
									alt="TaskFlow"
									className="size-6 object-contain"
								/>
							</div>
							<span className="text-xl font-bold tracking-tight text-foreground">
								TaskFlow
							</span>
						</div>

						<div className="text-center md:text-left space-y-2">
							<h2 className="text-3xl font-extrabold tracking-tight">
								Create Account
							</h2>
							<p className="text-sm text-muted-foreground">
								Sign up now to start tracking your projects and
								tasks
							</p>
						</div>

						<form
							onSubmit={handleSignupSubmit(onSignupSubmit)}
							className="space-y-4"
						>
							<div className="space-y-3.5">
								<Field className="space-y-1">
									<FieldLabel htmlFor="signup-name">
										Full Name
									</FieldLabel>
									<Input
										id="signup-name"
										type="text"
										placeholder="John Doe"
										{...registerSignup("name")}
										disabled={loadingState}
										className="w-full border-border focus:border-primary"
										aria-invalid={!!signupErrors.name}
									/>
									{signupErrors.name && (
										<FieldError>{signupErrors.name.message}</FieldError>
									)}
								</Field>

								<Field className="space-y-1">
									<FieldLabel htmlFor="signup-email">
										Email Address
									</FieldLabel>
									<Input
										id="signup-email"
										type="email"
										placeholder="name@example.com"
										{...registerSignup("email")}
										disabled={loadingState}
										className="w-full border-border focus:border-primary"
										aria-invalid={!!signupErrors.email}
									/>
									{signupErrors.email && (
										<FieldError>{signupErrors.email.message}</FieldError>
									)}
								</Field>

								<Field className="space-y-1">
									<FieldLabel htmlFor="signup-password">
										Password
									</FieldLabel>
									<InputGroup className="w-full border-border">
										<InputGroupInput
											id="signup-password"
											type={
												showSignupPassword
													? "text"
													: "password"
											}
											placeholder="••••••••"
											{...registerSignup("password")}
											disabled={loadingState}
											aria-invalid={!!signupErrors.password}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												onClick={() =>
													setShowSignupPassword(
														!showSignupPassword,
													)
												}
												disabled={loadingState}
												title={
													showSignupPassword
														? "Hide password"
														: "Show password"
												}
											>
												{showSignupPassword ? (
													<EyeOff className="size-3.5" />
												) : (
													<Eye className="size-3.5" />
												)}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									{signupErrors.password && (
										<FieldError>{signupErrors.password.message}</FieldError>
									)}
								</Field>
							</div>

							<div className="flex items-start space-x-2 py-1">
								<Checkbox
									id="terms"
									checked={acceptTerms}
									onCheckedChange={(checked) =>
										setAcceptTerms(!!checked)
									}
									disabled={loadingState}
									className="mt-0.5"
								/>
								<label
									htmlFor="terms"
									className="text-xs font-medium leading-normal cursor-pointer select-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									I accept the{" "}
									<Link
										href="/terms"
										className="text-primary hover:underline"
									>
										Terms of Service
									</Link>{" "}
									and{" "}
									<Link
										href="/privacy"
										className="text-primary hover:underline"
									>
										Privacy Policy
									</Link>
								</label>
							</div>

							<Button
								type="submit"
								disabled={loadingState}
								className="w-full"
							>
								{loadingState ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<>
										Create Account
										<ArrowRight className="size-4" />
									</>
								)}
							</Button>

							<div className="relative flex items-center justify-center my-3">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-border" />
								</div>
								<span className="relative px-3 bg-background text-xs uppercase text-muted-foreground font-medium">
									Or continue with
								</span>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<Button
									type="button"
									variant="outline"
									disabled={loadingState}
									onClick={() => handleSocialLogin("google")}
									className="w-full"
								>
									<svg
										className="size-4"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 488 512"
									>
										<path
											fill="currentColor"
											d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
										/>
									</svg>
								</Button>
								<Button
									type="button"
									variant="outline"
									disabled={loadingState}
									onClick={() => handleSocialLogin("github")}
									className="w-full"
								>
									<svg
										className="size-4"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 496 512"
									>
										<path
											fill="currentColor"
											d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.5 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5.7 1.3-1.6.7-4.6-1.3-6.2-2.2-2.3-5.2-2.6-6.5-.7zm-14.4-18c-.3 1.6 1 3.6 3.3 4.3 2 .7 4.3-.3 4.9-2 .3-1.6-1-3.6-3.3-4.3-2-.7-4.3.3-4.9 2z"
										/>
									</svg>
								</Button>
								<Button
									type="button"
									variant="outline"
									disabled={loadingState}
									onClick={() => handleSocialLogin("discord")}
									className="w-full"
								>
									<svg
										className="size-4"
										role="img"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 640 512"
									>
										<path
											fill="currentColor"
											d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.9,485.9,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.131a1.712,1.712,0,0,0-.788.676C39.1,183.651,18.2,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676,348.2,348.2,0,0,0,31.29-51.067,1.853,1.853,0,0,0-1.016-2.583,319.624,319.624,0,0,1-45.962-21.884,1.875,1.875,0,0,1-.185-3.12c3.109-2.336,6.217-4.764,9.135-7.234a1.808,1.808,0,0,1,1.887-.255c91.139,41.67,190.22,41.67,280.235,0a1.8,1.8,0,0,1,1.909.243c2.919,2.481,6.027,4.9,9.136,7.246a1.882,1.882,0,0,1-.173,3.119,301.407,301.407,0,0,1-45.973,21.884,1.857,1.857,0,0,0-1.016,2.6,378.188,378.188,0,0,0,31.278,51.055,1.925,1.925,0,0,0,2.075.688A486.077,486.077,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,602.13,167.436,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.923,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
										/>
									</svg>
								</Button>
							</div>
						</form>

						<div className="text-center text-sm text-muted-foreground mt-2">
							Already have an account?{" "}
							<button
								type="button"
								onClick={() => switchMode("login")}
								className="text-primary hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 inline-block"
							>
								Sign In
							</button>
						</div>
							</div>
						</div>
					</ScrollArea>
				</motion.div>
			</div>
		</div>
	);
}
