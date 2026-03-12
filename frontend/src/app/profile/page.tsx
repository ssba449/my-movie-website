import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, LogOut, Shield } from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/sign-in");
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect("/sign-in");
    }

    const isSubscribed = user.plan === "StreamVault+";

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-32">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 tracking-wide">Account Settings</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 h-12">
                            <User className="w-5 h-5 mr-3" />
                            Profile details
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-12">
                            <CreditCard className="w-5 h-5 mr-3" />
                            Billing
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-12">
                            <Settings className="w-5 h-5 mr-3" />
                            Preferences
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 h-12 mt-8">
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Info */}
                        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] border border-white/10 rounded-xl p-6 md:p-8">
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-[#E94560]/20 shrink-0">
                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-4 flex-grow">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{user.name || "StreamVault User"}</h2>
                                        <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Shield className="w-4 h-4 text-white" />
                                        <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">Edit Profile</Button>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Info */}
                        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.12)] border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white text-black/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                            <h3 className="text-xl font-bold text-white mb-6">Plan Details</h3>

                            {isSubscribed ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-white font-semibold">Premium Plan</span>
                                                <span className="bg-white text-black/20 text-white text-xs px-2 py-0.5 rounded font-bold">ACTIVE</span>
                                            </div>
                                            <p className="text-sm text-gray-400">4K + HDR, Ad-free, Unlimited Downloads</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold">$3.99 <span className="text-gray-400 text-sm font-normal">/ month</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button className="bg-white text-black text-white hover:bg-white text-black/90">Manage Subscription</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-black/30 rounded-lg p-4 border border-[#E94560]/30 shadow-inner">
                                        <p className="text-white font-semibold mb-1">No Active Subscription</p>
                                        <p className="text-sm text-gray-400">Subscribe now to unlock 4K streaming and ad-free content.</p>
                                    </div>
                                    <Button className="w-full bg-white text-black text-white hover:bg-white text-black/90 h-12 text-base font-bold">
                                        Subscribe for $3.99/mo
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
