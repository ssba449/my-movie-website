import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-300 pt-24 pb-16 px-6 sm:px-10 lg:px-20">
            <div className="max-w-4xl mx-auto bg-[#141414] rounded-2xl p-8 sm:p-12 border border-white/5 shadow-2xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Privacy Policy for StreamVault</h1>
                <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-6">
                    <strong>Last Updated:</strong> March 6, 2026
                </p>

                <div className="space-y-8 prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                    <p>
                        Welcome to <strong>StreamVault</strong>. Your privacy is important to us. This Privacy Policy explains how StreamVault collects, uses, and protects your information when you use our website and services.
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                        <p className="mb-4">StreamVault may collect certain information when you visit or use our website, including:</p>

                        <h3 className="text-xl font-medium text-white mb-2">a. Basic Usage Information</h3>
                        <p className="mb-3">We may collect technical information such as:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-6">
                            <li>IP address</li>
                            <li>Browser type</li>
                            <li>Device type</li>
                            <li>Pages visited</li>
                            <li>Date and time of access</li>
                        </ul>
                        <p className="mb-6">This information helps us improve website performance and user experience.</p>

                        <h3 className="text-xl font-medium text-white mb-2">b. Cookies and Similar Technologies</h3>
                        <p className="mb-3">StreamVault may use cookies or similar technologies to:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-6">
                            <li>Remember user preferences</li>
                            <li>Improve website performance</li>
                            <li>Analyze traffic and usage patterns</li>
                        </ul>
                        <p>You can disable cookies through your browser settings if you prefer.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="mb-3">The information collected may be used to:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-6">
                            <li>Provide and maintain the StreamVault service</li>
                            <li>Improve website functionality and user experience</li>
                            <li>Monitor website performance and security</li>
                            <li>Prevent fraud, abuse, or unauthorized access</li>
                        </ul>
                        <p>StreamVault does <strong>not sell personal information to third parties</strong>.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Third-Party Services</h2>
                        <p className="mb-4">
                            StreamVault may use third-party services or content providers to deliver streaming media or improve website functionality. These third parties may have their own privacy policies and practices.
                        </p>
                        <p>
                            StreamVault is not responsible for the privacy practices of external services or websites linked from our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                        <p className="mb-4">
                            We take reasonable technical and organizational measures to protect your information. However, no online service can guarantee complete security.
                        </p>
                        <p>Users access and use StreamVault at their own risk.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Children's Privacy</h2>
                        <p className="mb-4">
                            StreamVault is not intended for users under the age of 13. We do not knowingly collect personal information from children.
                        </p>
                        <p>If we become aware that such information has been collected, we will take steps to remove it.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. External Links</h2>
                        <p className="mb-4">
                            Our website may contain links to external websites. StreamVault is not responsible for the privacy practices or content of those third-party websites.
                        </p>
                        <p>Users should review the privacy policies of any external websites they visit.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to This Privacy Policy</h2>
                        <p className="mb-4">
                            StreamVault may update this Privacy Policy from time to time. When updates are made, the "Last Updated" date will be revised.
                        </p>
                        <p>Continued use of the website after changes means you accept the updated policy.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Contact</h2>
                        <p>
                            If you have any questions regarding this Privacy Policy, you may contact us through the website’s contact page.
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
