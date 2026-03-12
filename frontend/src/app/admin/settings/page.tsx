"use client";

import { Save, Settings as SettingsIcon, Shield, Bell, Database, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Settings saved successfully!");
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 tracking-wide">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                        <SettingsIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Platform Settings</h1>
                </div>
                <p className="text-gray-400 text-lg">Configure global parameters and security protocols.</p>
            </header>

            <div className="grid gap-8">
                {/* General Section */}
                <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">General Configuration</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-400 px-1">Platform Name</label>
                            <Input defaultValue="StreamVault" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-400 px-1">Primary Support Email</label>
                            <Input defaultValue="support@streamvault.com" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                        </div>
                    </div>
                </section>

                {/* API & Services Section */}
                <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-xl font-bold text-white">External Integrations</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-400 px-1">TMDB API Key</label>
                            <Input type="password" defaultValue="••••••••••••••••••••••••" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-400 px-1">Febbox Cookie Token</label>
                            <Input type="password" defaultValue="••••••••••••••••••••••••" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-bold text-white">Security & Access</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div>
                                <h3 className="text-white font-medium">Maintenance Mode</h3>
                                <p className="text-xs text-gray-500">Only administrators can access the frontend.</p>
                            </div>
                            <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-not-allowed">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div>
                                <h3 className="text-white font-medium">New User Registration</h3>
                                <p className="text-xs text-gray-500">Allow users to create new accounts.</p>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button variant="ghost" className="text-gray-400 hover:text-white">Discard Changes</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-white text-black hover:bg-gray-200 px-8 h-12 rounded-2xl font-bold shadow-xl transition-transform active:scale-95"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                        <Save className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
