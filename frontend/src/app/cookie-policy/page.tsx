import React from 'react';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-300 pt-24 pb-16 px-6 sm:px-10 lg:px-20">
            <div className="max-w-4xl mx-auto bg-[#141414] rounded-2xl p-8 sm:p-12 border border-white/5 shadow-2xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cookie Policy for StreamVault</h1>
                <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-6">
                    <strong>Last Updated:</strong> March 6, 2026
                </p>

                <div className="space-y-8 prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                    <p>
                        This Cookie Policy explains how <strong>StreamVault</strong> uses cookies and similar technologies when you visit or use our website.
                    </p>
                    <p>
                        By continuing to use StreamVault, you agree to the use of cookies as described in this policy.
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies</h2>
                        <p className="mb-4">
                            Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit a website. They help websites remember user preferences, improve functionality, and analyze website usage.
                        </p>
                        <p>
                            Cookies do not usually contain personally identifiable information but may store technical data related to your browsing session.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. How StreamVault Uses Cookies</h2>
                        <p className="mb-4">StreamVault may use cookies for the following purposes:</p>

                        <h3 className="text-xl font-medium text-white mb-2">Essential Cookies</h3>
                        <p className="mb-6">
                            These cookies are necessary for the website to function properly. They enable core features such as page navigation, video playback functionality, and security.
                        </p>

                        <h3 className="text-xl font-medium text-white mb-2">Performance and Analytics Cookies</h3>
                        <p className="mb-6">
                            These cookies help us understand how visitors interact with the website by collecting anonymous information such as page visits, load times, and usage patterns. This helps us improve the performance and reliability of the platform.
                        </p>

                        <h3 className="text-xl font-medium text-white mb-2">Preference Cookies</h3>
                        <p className="mb-6">
                            These cookies remember user settings and preferences such as language selection or interface settings to improve your experience on future visits.
                        </p>

                        <h3 className="text-xl font-medium text-white mb-2">Security Cookies</h3>
                        <p className="mb-6">
                            These cookies help detect suspicious activity, protect against abuse, and maintain the security of the StreamVault platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Third-Party Cookies</h2>
                        <p className="mb-4">
                            StreamVault may use third-party services that place cookies on your device. These cookies may be used for analytics, performance monitoring, or media delivery.
                        </p>
                        <p className="mb-4">
                            Third-party services operate independently and may have their own cookie policies.
                        </p>
                        <p>
                            StreamVault does not control the cookies used by third-party providers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Managing Cookies</h2>
                        <p className="mb-4">
                            Most web browsers allow users to manage or disable cookies through browser settings.
                        </p>
                        <p className="mb-3">You can typically:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-6">
                            <li>Delete stored cookies</li>
                            <li>Block certain cookies</li>
                            <li>Receive notifications when cookies are placed</li>
                        </ul>
                        <p>Please note that disabling cookies may affect some functionality of the website.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Changes to This Cookie Policy</h2>
                        <p className="mb-4">
                            StreamVault may update this Cookie Policy periodically to reflect changes in technology, law, or website functionality.
                        </p>
                        <p>
                            Any updates will be posted on this page with an updated “Last Updated” date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Contact</h2>
                        <p>
                            If you have any questions regarding this Cookie Policy, please contact us through the contact page on the StreamVault website.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
                    <p>© 2026 StreamVault. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
