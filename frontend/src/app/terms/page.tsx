import React from 'react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-300 pt-24 pb-16 px-6 sm:px-10 lg:px-20">
            <div className="max-w-4xl mx-auto bg-[#141414] rounded-2xl p-8 sm:p-12 border border-white/5 shadow-2xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Terms of Service for StreamVault</h1>
                <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-6">
                    <strong>Last Updated:</strong> March 6, 2026
                </p>

                <div className="space-y-8 prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                    <p>
                        Welcome to <strong>StreamVault</strong>. By accessing or using this website, you agree to comply with and be bound by the following Terms of Service. If you do not agree with these terms, please do not use the website.
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By using StreamVault, you confirm that you are at least 13 years old and agree to these Terms of Service and our Privacy Policy.
                        </p>
                        <p>
                            StreamVault reserves the right to update or modify these terms at any time without prior notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                        <p className="mb-4">
                            StreamVault provides an online platform that allows users to browse and stream movies and television series through integrated media sources and third-party providers.
                        </p>
                        <p>
                            StreamVault does not guarantee the availability, accuracy, or quality of any content available on the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                        <p className="mb-3">By using StreamVault, you agree that you will not:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-6">
                            <li>Use the website for illegal purposes</li>
                            <li>Attempt to disrupt or damage the website or its servers</li>
                            <li>Attempt to bypass security features or protections</li>
                            <li>Copy, distribute, or exploit website content without permission</li>
                            <li>Use automated bots or scraping tools that harm the service</li>
                        </ul>
                        <p>Users are responsible for ensuring their use of the website complies with applicable laws in their country.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Content</h2>
                        <p className="mb-4">
                            StreamVault may provide access to content hosted or provided by third-party services. These services operate independently and may have their own terms and privacy policies.
                        </p>
                        <p>
                            StreamVault does not control and is not responsible for third-party content, availability, or actions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
                        <p className="mb-4">
                            All branding, logos, website design, and original content associated with StreamVault are protected by applicable intellectual property laws.
                        </p>
                        <p>
                            Users may not reproduce, modify, distribute, or exploit any part of the website without prior permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Disclaimer of Warranties</h2>
                        <p className="mb-4">
                            StreamVault is provided on an <strong>“as is” and “as available”</strong> basis.
                        </p>
                        <p className="mb-3">We do not guarantee:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-6">
                            <li>Continuous or uninterrupted service</li>
                            <li>That all content will be available at all times</li>
                            <li>That the service will be free from errors or technical issues</li>
                        </ul>
                        <p>Use of the website is at your own risk.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
                        <p className="mb-4">
                            StreamVault and its operators shall not be held responsible for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the website.
                        </p>
                        <p>This includes loss of data, service interruptions, or technical failures.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Termination of Access</h2>
                        <p>
                            StreamVault reserves the right to suspend or terminate access to the website at any time if a user violates these Terms of Service or engages in harmful behavior toward the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">9. External Links</h2>
                        <p className="mb-4">
                            The website may contain links to external websites or services. StreamVault is not responsible for the content, policies, or practices of these external sites.
                        </p>
                        <p>Users access such websites at their own discretion.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to These Terms</h2>
                        <p className="mb-4">
                            We may update these Terms of Service periodically. Updated terms will be posted on this page with a revised “Last Updated” date.
                        </p>
                        <p>Continued use of the website after changes indicates acceptance of the updated terms.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">11. Contact</h2>
                        <p>
                            If you have questions regarding these Terms of Service, please contact us through the website’s contact page.
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
