import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Film,
    Tv,
    FolderSync,
    Settings,
    ListVideo,
    Subtitles,
    CreditCard,
    ArrowLeft
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
        redirect("/sign-in");
    }

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Import Content", href: "/admin/import", icon: FolderSync },
        { name: "Movies", href: "/admin/movies", icon: Film },
        { name: "TV Shows", href: "/admin/shows", icon: Tv },
        { name: "Febbox Sync", href: "/admin/febbox", icon: FolderSync },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
        { name: "Subtitles", href: "/admin/subtitles", icon: Subtitles },
        { name: "Watchlists", href: "/admin/watchlists", icon: ListVideo },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#000000] flex text-white font-sans selection:bg-white/30">
            {/* Sidebar (Apple TV style - blurred, translucent, sleek) */}
            <aside className="w-[260px] fixed inset-y-0 left-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-3xl border-r border-white/5 flex flex-col pt-8 pb-6">
                <div className="px-8 pb-8">
                    <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        StreamVault <span className="text-[#E94560]">Admin</span>
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                <Icon className="w-5 h-5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 mt-auto pt-4 border-t border-white/5">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-[260px] min-h-screen bg-[#0B0B0F] relative">
                {/* Subtle ambient glow top left */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10 h-full p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
