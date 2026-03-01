import { User, Settings as SettingsIcon, CreditCard, Bell, LogOut, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="min-h-[85vh] bg-transparent pt-12 md:pt-24 pb-32">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-wide">Account Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-2 md:pr-4 md:border-r border-[#16213E]">
                        <Button variant="ghost" className="w-full justify-start text-white bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)]/80 transition-colors">
                            <User className="mr-3 w-4 h-4 text-white/80" /> Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)]/50 transition-colors">
                            <CreditCard className="mr-3 w-4 h-4" /> Subscription & Billing
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)]/50 transition-colors">
                            <SettingsIcon className="mr-3 w-4 h-4" /> Preferences
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)]/50 transition-colors">
                            <Bell className="mr-3 w-4 h-4" /> Notifications
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-8">
                        {/* Profile Section */}
                        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                            <h2 className="text-lg md:text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Profile Details</h2>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 text-center md:text-left">
                                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-white/80 text-3xl font-bold ring-2 ring-primary ring-offset-4 ring-offset-[#16213E]">
                                    SV
                                </div>
                                <div className="flex flex-col justify-center h-24 gap-3">
                                    <h3 className="text-white font-medium">John Doe</h3>
                                    <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10 transition-colors text-xs">
                                        Change Avatar
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Display Name</label>
                                    <input type="text" defaultValue="John Doe" className="w-full bg-transparent border border-white/10 focus:border-primary rounded-lg px-4 py-2.5 text-white outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Email Address</label>
                                    <input type="email" defaultValue="johndoe@example.com" disabled className="w-full bg-transparent/50 border border-transparent rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed" />
                                </div>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-8 transition-transform hover:scale-[1.03]">
                                Save Changes
                            </Button>
                        </div>

                        {/* Language Preferences */}
                        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                            <h2 className="text-lg md:text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Language Preferences</h2>
                            <div className="flex flex-col sm:flex-row items-stretch gap-4 max-w-md">
                                <div className="flex-1 p-4 rounded-xl border-2 border-primary bg-primary/5 flex justify-between items-center cursor-pointer relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-white font-semibold relative z-10">English (US)</span>
                                    <Check className="w-5 h-5 text-white/80 relative z-10" />
                                </div>
                                <div className="flex-1 p-4 rounded-xl border-2 border-transparent hover:border-white/20 bg-transparent flex justify-between items-center cursor-pointer transition-colors group">
                                    <span className="text-white font-semibold font-cairo group-hover:text-white/80 transition-colors" dir="rtl">العربية (AR)</span>
                                </div>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="pt-4 flex justify-between items-center border-t border-[#16213E]">
                            <div className="text-sm text-muted-foreground">
                                <p>Ensure your watch progress is saved.</p>
                            </div>
                            <Button variant="destructive" className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold px-6 border-none shadow-lg shadow-[#C0392B]/20">
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
