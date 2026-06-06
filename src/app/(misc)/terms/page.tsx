"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";

export default function TermsPage() {
	return (
		<ScrollArea className="h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20 relative">
			{/* Grid & Radial Glowing Gradients */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] pointer-events-none" />
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

			<Header />

			<main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-32">
				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
						<p className="text-sm text-muted-foreground">
							Last updated: June 6, 2026
						</p>
					</div>

					<hr className="border-border" />

					<div className="space-y-6 prose dark:prose-invert max-w-none text-foreground/80">
						<section>
							<h2 className="text-lg font-bold text-foreground">
								1. Acceptance of Terms
							</h2>
							<p className="text-sm font-light leading-relaxed">
								By accessing and using TaskFlow (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								2. Description of Service
							</h2>
							<p className="text-sm font-light leading-relaxed">
								TaskFlow is a project management and team collaboration platform. We provide tools for organizing tasks, tracking time, and managing team communication within organization-based workspaces.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								3. User Accounts
							</h2>
							<p className="text-sm font-light leading-relaxed">
								You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								4. Acceptable Use
							</h2>
							<p className="text-sm font-light leading-relaxed">
								You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service. Prohibited activities include attempting to gain unauthorized access to our systems or other users&apos; accounts.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								5. Intellectual Property
							</h2>
							<p className="text-sm font-light leading-relaxed">
								The Service and its original content, features, and functionality are owned by MaYTaS and are protected by international copyright, trademark, and other intellectual property laws.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								6. Limitation of Liability
							</h2>
							<p className="text-sm font-light leading-relaxed">
								In no event shall MaYTaS be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								7. Changes to Terms
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We reserve the right to modify or replace these terms at any time. We will provide notice of any significant changes by posting the new terms on this page.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								8. Contact Us
							</h2>
							<p className="text-sm font-light leading-relaxed">
								If you have any questions about these Terms, please contact us at support@taskflow.com.
							</p>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</ScrollArea>
	);
}
