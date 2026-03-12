import { MonitorPlay, Smartphone, RefreshCw, Lock } from "lucide-react";

export default function FeaturesStrip() {
    const features = [
        { text: "Cancel Anytime", icon: <RefreshCw className="w-6 h-6 text-white" /> },
        { text: "Watch on Any Device", icon: <MonitorPlay className="w-6 h-6 text-white" /> },
        { text: "New Content Every Week", icon: <Smartphone className="w-6 h-6 text-white" /> },
        { text: "Secure Payment", icon: <Lock className="w-6 h-6 text-white" /> },
    ];

    return (
        <div className="relative z-20 -mt-8 md:-mt-12 px-4 md:px-8 max-w-[1200px] mx-auto">
            <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] rounded-[32px] border border-[rgba(255,255,255,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.35)] py-8 px-6 transition-all duration-700">
                <div className="flex flex-wrap justify-center md:justify-around items-center gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group">
                            <div className="p-4 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.35)] group-hover:scale-110 group-hover:bg-white transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
                                <div className="group-hover:text-black group-hover:[&>svg]:text-black transition-colors duration-700">
                                    {f.icon}
                                </div>
                            </div>
                            <span className="text-white/80 font-medium text-[15px] tracking-wide group-hover:text-white transition-colors duration-700">
                                {f.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
