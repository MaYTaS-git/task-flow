"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";

export default function PrivacyPage() {
	return (
		<ScrollArea className="h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20 relative">
			{/* Grid & Radial Glowing Gradients */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] pointer-events-none" />
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

			<Header />

			<main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-32">
				<div className="space-y-12">
					<div className="text-center space-y-4">
						<h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
						<p className="text-sm text-muted-foreground">
							Last updated: June 6, 2026
						</p>
					</div>

					<hr className="border-border" />

					<div className="space-y-6 prose dark:prose-invert max-w-none text-foreground/80">
						<section>
							<h2 className="text-lg font-bold text-foreground">
								1. Information We Collect
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We collect information you provide directly to us, such as when you create an account, create an organization, or communicate with us. This includes your name, email address, and any other information you choose to provide.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								2. How We Use Your Information
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We use the information we collect to provide, maintain, and improve our Service, to communicate with you, and to protect TaskFlow and our users.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								3. Information Sharing
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We do not share your personal information with third parties except as described in this Privacy Policy, such as with your consent or as required by law.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								4. Data Security
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								5. Data Retention
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We store the information we collect for as long as is necessary for the purpose(s) for which we originally collected it, or for other legitimate business purposes.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								6. Your Choices
							</h2>
							<p className="text-sm font-light leading-relaxed">
								You may update or correct your account information at any time by logging into your account settings. You can also delete your account, which will remove your personal information from our active databases.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								7. Cookies
							</h2>
							<p className="text-sm font-light leading-relaxed">
								We use cookies and similar technologies to collect information about your browsing activities and to remember your preferences.
							</p>
						</section>

						<section>
							<h2 className="text-lg font-bold text-foreground">
								8. Contact Us
							</h2>
							<p className="text-sm font-light leading-relaxed">
								If you have any questions about this Privacy Policy, please contact us at privacy@taskflow.com.
							</p>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</ScrollArea>
	);
}
