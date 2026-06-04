import React from "react";
import { ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { BackButton } from "@/components/common/back-button";

export const metadata = {
	title: "Terms of Service - TaskFlow",
	description: "Terms of Service and conditions for using TaskFlow.",
};

export default function TermsPage() {
	return (
		<ScrollArea className="h-screen w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans selection:bg-primary/20 relative">
			<Header />

			{/* Main Content */}
			<main className="container max-w-3xl mx-auto px-4 pt-28 pb-16">
				<div className="space-y-8">
					{/* Hero Section */}
					<div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
						<BackButton />
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit">
							<ShieldCheck className="size-3.5" />
							Agreement
						</div>
						<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-linear-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
							Terms of Service
						</h1>
						<p className="text-sm text-neutral-500 dark:text-neutral-400">
							Last updated: June 4, 2026
						</p>
					</div>

					<hr className="border-neutral-200 dark:border-neutral-800" />

					{/* Terms List */}
					<div className="space-y-6 prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
						<p className="leading-relaxed">
							Welcome to TaskFlow. These Terms of Service
							(&ldquo;Terms&rdquo;) govern your access to and use
							of our task management application and services.
							Please read them carefully before using TaskFlow.
						</p>
						<p className="leading-relaxed">
							By accessing or using TaskFlow, you agree to be
							bound by these Terms and our Privacy Policy. If you
							do not agree to these Terms, you may not access or
							use our services.
						</p>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								1. Account Registration
							</h2>
							<p className="leading-relaxed text-sm">
								To use certain features of TaskFlow, you must
								register for an account. You agree to provide
								accurate, current, and complete information
								during the registration process and to update
								such information to keep it accurate, current,
								and complete. You are responsible for
								safeguarding your password and account details,
								and you accept full responsibility for all
								activities that occur under your account.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								2. Acceptable Use Policy
							</h2>
							<p className="leading-relaxed text-sm">
								You agree not to use TaskFlow for any unlawful
								purpose or in any way that interrupts, damages,
								or impairs the service. Prohibited behaviors
								include, but are not limited to:
							</p>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								<li>
									Uploading, storing, or transmitting
									malicious code, viruses, or malware.
								</li>
								<li>
									Attempting to gain unauthorized access to
									our systems, servers, or user database.
								</li>
								<li>
									Using automated tools (bots, crawlers,
									scrapers) to access or harvest data without
									permission.
								</li>
								<li>
									Impersonating other persons or entities, or
									falsifying your identity.
								</li>
							</ul>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								3. Intellectual Property Rights
							</h2>
							<p className="leading-relaxed text-sm">
								TaskFlow and its original content, features,
								layout, and functionality are and will remain
								the exclusive property of TaskFlow and its
								licensors. Our trademarks, logos, and service
								marks may not be used in connection with any
								product or service without our prior written
								consent.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								4. User Content
							</h2>
							<p className="leading-relaxed text-sm">
								You retain all rights to any data, projects,
								tasks, comments, or materials you upload or
								input into TaskFlow (&ldquo;User
								Content&rdquo;). By uploading User Content, you
								grant us a worldwide, non-exclusive,
								royalty-free license to host, store, and process
								your content solely to provide the services to
								you.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								5. Termination
							</h2>
							<p className="leading-relaxed text-sm">
								We reserve the right to suspend or terminate
								your account and restrict your access to all or
								part of TaskFlow at any time, with or without
								cause, and with or without notice, effective
								immediately. If you wish to terminate your
								account, you may do so through your profile
								settings or by contacting our support.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								6. Limitation of Liability
							</h2>
							<p className="leading-relaxed text-sm">
								In no event shall TaskFlow, its directors,
								employees, partners, or agents be liable for any
								indirect, incidental, special, consequential, or
								punitive damages, including without limitation,
								loss of profits, data, use, goodwill, or other
								intangible losses, resulting from your access to
								or use of, or inability to access or use, the
								service.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								7. Changes to These Terms
							</h2>
							<p className="leading-relaxed text-sm">
								We reserve the right to modify or replace these
								Terms at any time. If a revision is material, we
								will provide at least 30 days&apos; notice prior
								to any new terms taking effect. By continuing to
								access or use TaskFlow after those revisions
								become effective, you agree to be bound by the
								revised Terms.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								8. Contact Information
							</h2>
							<p className="leading-relaxed text-sm">
								If you have any questions about these Terms of
								Service, please contact us at
								support@taskflow.example.com.
							</p>
						</section>
					</div>
				</div>
			</main>
			<Footer />
		</ScrollArea>
	);
}
