import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-transparent py-16 md:py-24 border-t border-white/10 relative z-20">
            <div className="max-w-[1440px] mx-auto px-10 xl:px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                    <h3 className="text-3xl font-bebas font-bold text-white mb-6 tracking-widest uppercase">STREAMVAULT</h3>
                    <p className="text-white/50 text-[15px] mb-8 font-medium leading-relaxed max-w-xs">
                        Watch Anything. Anywhere. Anytime. The definitive spatial cinematic experience.
                    </p>
                    <div className="flex gap-6 relative z-30">
                        <a
                            href="https://www.instagram.com/streamvault.tv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:text-white transition-colors duration-500"
                        >
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a
                            href="https://x.com/StreamVaultTV?s=20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:text-white transition-colors duration-500"
                        >
                            <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.309 17.41z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.tiktok.com/@streamvault_tv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:text-white transition-colors duration-500"
                        >
                            <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1 .1z" />
                            </svg>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-6 text-white text-[16px] tracking-wide">Navigation</h4>
                    <ul className="space-y-4 text-[15px] font-medium text-white/50">
                        <li><Link href="/" className="hover:text-white transition-colors duration-500">Home</Link></li>
                        <li><Link href="/movies" className="hover:text-white transition-colors duration-500">Movies</Link></li>
                        <li><Link href="/series" className="hover:text-white transition-colors duration-500">Series</Link></li>
                        <li><Link href="/pricing" className="hover:text-white transition-colors duration-500">Plans</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-6 text-white text-[16px] tracking-wide">Legal</h4>
                    <ul className="space-y-4 text-[15px] font-medium text-white/50">
                        <li><Link href="/privacy" className="hover:text-white transition-colors duration-500">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors duration-500">Terms of Service</Link></li>
                        <li><Link href="/cookie-policy" className="hover:text-white transition-colors duration-500">Cookie Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-6 text-white text-[16px] tracking-wide">Location</h4>
                    <div className="flex items-center gap-3 mb-6">
                        <button className="text-[15px] font-bold text-white">United States</button>
                        <span className="text-white/30">|</span>
                        <button className="text-[15px] text-white/50 hover:text-white transition-colors duration-500 font-medium">English</button>
                    </div>
                    <p className="text-[15px] text-white/50 font-medium">Support: help@streamvault.com</p>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-10 xl:px-16 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[13px] font-medium text-white/40 gap-4">
                <p>&copy; {new Date().getFullYear()} StreamVault Inc. All rights reserved.</p>
                <div className="flex gap-6 uppercase tracking-wider font-bold text-[11px]">
                    <span>Visa</span>
                    <span>Mastercard</span>
                    <span>Apple Pay</span>
                </div>
            </div>

            <div className="md:hidden h-[74px] w-full" /> {/* Padding for mobile tab bar */}
        </footer>
    );
}
