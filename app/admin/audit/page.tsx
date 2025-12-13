
'use client';

import { useState, useEffect } from 'react';
import { ScrollText } from 'lucide-react';

export default function AuditLogPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/admin/audit_log')
            .then(res => res.json())
            .then(data => {
                setLogs(data.logs || []);
                setLoading(false);
            })
            .catch(e => setLoading(false));
    }, []);

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ScrollText className="w-8 h-8 text-gray-700" /> Admin Audit Log
            </h1>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 font-mono text-sm">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {log.admin_email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 max-w-xs truncate">
                                    {log.target}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 max-w-xs truncate">
                                    {JSON.stringify(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
