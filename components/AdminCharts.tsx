
'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Green, Red, Amber

export function GrowthChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">No Data Available</div>;

    return (
        <div className="h-72 w-full bg-white p-4 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">User Growth (Last 90 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function FinancialChart({ settled, debt }: { settled: number, debt: number }) {
    const data = [
        { name: 'Collected', value: settled },
        { name: 'Debt', value: debt },
    ];
    // Avoid rendering empty chart if both 0
    if (settled === 0 && debt === 0) {
        data.push({ name: 'No Data', value: 1 }); // Placeholder
    }

    return (
        <div className="h-72 w-full bg-white p-4 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Financial Overview</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `₹${val}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
