"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const registerRes = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!registerRes.ok) {
                const errorText = await registerRes.text();
                setError(errorText || "Registration failed");
                setLoading(false);
                return;
            }

            // Auto login after successful registration
            const loginRes = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (loginRes?.error) {
                setError("Login failed after registration");
            } else {
                router.push("/browse");
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred during registration");
        } finally {
            if (!router) setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-24 relative z-20">
            <div className="w-full max-w-[440px] space-y-8 rounded-[32px] bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.12)] transition-all duration-700">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">Create an Account</h2>
                    <p className="text-[15px] font-medium text-white/50 tracking-wide">Join StreamVault and start watching</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 mt-8">
                    {error && (
                        <div className="rounded-[16px] bg-red-500/10 p-4 border border-red-500/30">
                            <p className="text-[14px] font-medium text-red-500">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="text-[14px] font-medium text-white/70 ml-2">Name</label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-14 mt-2 bg-[rgba(0,0,0,0.2)] border-white/10 text-white rounded-[16px] px-5 focus-visible:ring-1 focus-visible:ring-white/30 text-[16px]"
                            />
                        </div>
                        <div>
                            <label className="text-[14px] font-medium text-white/70 ml-2">Email</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 mt-2 bg-[rgba(0,0,0,0.2)] border-white/10 text-white rounded-[16px] px-5 focus-visible:ring-1 focus-visible:ring-white/30 text-[16px]"
                            />
                        </div>
                        <div>
                            <label className="text-[14px] font-medium text-white/70 ml-2">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-14 mt-2 bg-[rgba(0,0,0,0.2)] border-white/10 text-white rounded-[16px] px-5 focus-visible:ring-1 focus-visible:ring-white/30 text-[16px]"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-14 text-[16px] font-bold rounded-full bg-white hover:bg-white/90 text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95 duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]" disabled={loading}>
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>

                <p className="text-center text-[15px] font-medium text-white/40 mt-8">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="font-bold text-white hover:text-white/80 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
