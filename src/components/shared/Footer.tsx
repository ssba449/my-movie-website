import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';

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
                        <Instagram className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors duration-500" />
                        <Twitter className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors duration-500" />
                        <Youtube className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors duration-500" />
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
