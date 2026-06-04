import React from "react";
import { KeyRound } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { BackButton } from "@/components/common/back-button";

export const metadata = {
	title: "Privacy Policy - TaskFlow",
	description: "Privacy Policy and data practices for TaskFlow.",
};

export default function PrivacyPage() {
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
							<KeyRound className="size-3.5" />
							Privacy
						</div>
						<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-linear-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
							Privacy Policy
						</h1>
						<p className="text-sm text-neutral-500 dark:text-neutral-400">
							Last updated: June 4, 2026
						</p>
					</div>

					<hr className="border-neutral-200 dark:border-neutral-800" />

					{/* Privacy List */}
					<div className="space-y-6 prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
						<p className="leading-relaxed">
							At TaskFlow, we are committed to protecting your
							privacy and security. This Privacy Policy outlines
							how we collect, use, disclose, and protect your
							information when you use our task management
							application.
						</p>
						<p className="leading-relaxed">
							By registering for, using, or accessing TaskFlow,
							you agree to the collection and use of information
							in accordance with this policy.
						</p>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								1. Information We Collect
							</h2>
							<p className="leading-relaxed text-sm">
								We collect several types of information to
								provide and improve our service to you:
							</p>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								<li>
									<strong>Account Data:</strong> When you
									register an account, we collect your name,
									email address, profile picture (if provided
									via OAuth), and credentials.
								</li>
								<li>
									<strong>Workspace Data:</strong> We store
									the projects, tasks, boards, comments, tags,
									and files you create or upload in TaskFlow.
								</li>
								<li>
									<strong>Usage Data:</strong> We
									automatically collect information about how
									you interact with our application, such as
									your IP address, browser type, device
									information, operating system, and pages
									visited.
								</li>
							</ul>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								2. How We Use Your Information
							</h2>
							<p className="leading-relaxed text-sm">
								We use the collected information for various
								purposes:
							</p>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								<li>
									To provide, maintain, and support the
									TaskFlow application.
								</li>
								<li>
									To manage your account, authenticate logins,
									and handle session lifetimes.
								</li>
								<li>
									To communicate with you regarding security
									updates, feature additions, or support
									requests.
								</li>
								<li>
									To analyze and monitor usage behaviors to
									improve usability and optimize server
									performance.
								</li>
							</ul>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								3. Data Storage and Security
							</h2>
							<p className="leading-relaxed text-sm">
								Your data is stored in secure cloud database
								environments. We use industry-standard security
								measures (such as TLS encryption in transit and
								hashing passwords with secure algorithms) to
								safeguard your personal details and workspace
								information. However, no method of transmission
								over the Internet or method of electronic
								storage is 100% secure, and we cannot guarantee
								absolute security.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								4. Cookies and Session Lifetimes
							</h2>
							<p className="leading-relaxed text-sm">
								We use cookies and similar tracking technologies
								to track the activity on our service and hold
								certain information. When you log in with
								&ldquo;Remember me for 30 days&rdquo; checked,
								we configure a secure cookie that keeps your
								session active for up to 30 days. If unchecked,
								the session expires dynamically in 1 day. You
								can instruct your browser to refuse all cookies,
								but doing so may prevent you from logging in or
								using some features of our service.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								5. Sharing of Your Information
							</h2>
							<p className="leading-relaxed text-sm">
								We do not sell, trade, or rent your personal
								information to third parties. We may share
								information only in the following circumstances:
							</p>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								<li>
									With trusted third-party service providers
									who assist us in operating our application
									and serving you (e.g., hosting providers,
									authentication providers), under strict
									confidentiality agreements.
								</li>
								<li>
									If required to do so by law, court order, or
									to comply with a legal obligation or protect
									the rights and safety of TaskFlow, its
									users, or others.
								</li>
							</ul>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								6. Your Rights and Choices
							</h2>
							<p className="leading-relaxed text-sm">
								Depending on your location, you may have rights
								regarding your personal data. These typically
								include the right to access, correct, delete, or
								limit the use of your personal details. You can
								update your account information directly in your
								profile settings or delete your account entirely
								by contacting support.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								7. Changes to This Privacy Policy
							</h2>
							<p className="leading-relaxed text-sm">
								We may update our Privacy Policy from time to
								time. We will notify you of any changes by
								posting the new Privacy Policy on this page and
								updating the &ldquo;Last updated&rdquo; date. We
								encourage you to review this Policy periodically
								for any changes.
							</p>
						</section>

						<section className="space-y-3 pt-4">
							<h2 className="text-lg font-bold text-neutral-900 dark:text-white">
								8. Contact Us
							</h2>
							<p className="leading-relaxed text-sm">
								If you have any questions about this Privacy
								Policy, please contact us at
								privacy@taskflow.example.com.
							</p>
						</section>
					</div>
				</div>
			</main>
			<Footer />
		</ScrollArea>
	);
}
