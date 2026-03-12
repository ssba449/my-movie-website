"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

const data = [
    { name: 'Jan', users: 400, revenue: 240, streams: 1200 },
    { name: 'Feb', users: 800, revenue: 539, streams: 2100 },
    { name: 'Mar', users: 1100, revenue: 850, streams: 3400 },
    { name: 'Apr', users: 1500, revenue: 1200, streams: 4800 },
    { name: 'May', users: 2100, revenue: 1980, streams: 6100 },
    { name: 'Jun', users: 2900, revenue: 2500, streams: 8400 },
    { name: 'Jul', users: 3800, revenue: 3200, streams: 11000 },
];

export function AdminCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 w-full">
            {/* User Growth Area Chart */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 h-[400px] flex flex-col relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />

                <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                    User Growth Overview
                </h3>

                <div className="flex-1 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#ffffff40"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#ffffff40"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#3B82F6' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 h-[400px] flex flex-col relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />

                <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    Revenue Analytics
                </h3>

                <div className="flex-1 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                            <XAxis
                                dataKey="name"
                                stroke="#ffffff40"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#ffffff40"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#10B981"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
