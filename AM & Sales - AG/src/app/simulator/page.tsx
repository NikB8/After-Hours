
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock Transcripts
const DEMO_SCENARIOS = {
    INTERNAL: {
        title: "Internal Cluster Review (North)",
        transcript: `
Cluster Lead: "Okay, let's look at the North region churn. TechNova is flagged as high risk."
AM (Nikhil): "Yeah, their deployment stalled. We need the product team to fix the API sync issue."
Cluster Lead: "Agreed. Also, Nikhil, your expense report for the Delhi visit is still pending approval from Finance."
AM (Nikhil): "I'll submit the receipts by Friday."
Cluster Lead: "One more thing - we need to hire a new Junior AM for Mumbai. Can we get HR to open a req?"
        `,
        expectedScope: "INTERNAL_CLUSTER",
        aiPersona: "Executive Assistant"
    },
    EXTERNAL: {
        title: "Client Check-in: Acme Corp",
        transcript: `
AM (Nikhil): "Hi John, how is the new dashboard working for you?"
Client (John): "It's good, but we found a bug in the reporting module. The export button throws a 500 error."
AM (Nikhil): "I'm sorry about that. I'll file a ticket with engineering immediately."
Client (John): "Also, we want to upgrade to the Enterprise plan next month."
AM (Nikhil): "That's great news! I'll prepare the contract amendment."
        `,
        expectedScope: "CLIENT_EXTERNAL",
        aiPersona: "Client Success Manager"
    }
};

export default function SimulatorPage() {
    const [scenario, setScenario] = useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
    const [isProcessing, setIsProcessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [results, setResults] = useState<any>(null);

    const runSimulation = async () => {
        setIsProcessing(true);
        setLogs([]);
        setResults(null);

        const addLog = (msg: string) => setLogs(prev => [...prev, msg]);
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

        // Step 1: Ingestion
        addLog(`> Receiving Audio Stream...`);
        await wait(800);
        addLog(`> Audio Duration: 04:12 mins`);
        addLog(`> Sending to Transcription Engine (Whisper v3)...`);
        await wait(1000);
        addLog(`> Transcript Generated (452 words)`);

        // Step 2: Analysis
        addLog(`> 分析 Context & Scope...`); // Intentional "tech" look
        await wait(800);

        const currentData = DEMO_SCENARIOS[scenario];
        addLog(`> DETECTED SCOPE: [${currentData.expectedScope}]`);
        addLog(`> Selecting System Prompt: [${currentData.aiPersona}]`);
        await wait(600);

        // Step 3: Extraction
        addLog(`> Extracting Entities & Action Items...`);
        await wait(1200);

        if (scenario === 'INTERNAL') {
            addLog(`> Found Action: "Expense Report Pending"`);
            addLog(`> Found Action: "Hire Junior AM"`);
            addLog(`> Routing Logic: [INTERNAL] -> Skip Jira`);
            addLog(`> Creating Notifications for [FINANCE] and [HR]...`);
        } else {
            addLog(`> Found Action: "Fix Reporting Bug"`);
            addLog(`> Routing Logic: [EXTERNAL] -> Create Jira Ticket`);
            addLog(`> API Call: POST /jira/issues/create...`);
        }

        await wait(500);
        addLog(`> PROCESS COMPLETE.`);

        // Set Results
        setResults(scenario === 'INTERNAL' ? {
            actions: [
                { text: "Submit Expense Receipts", type: "INTERNAL", route: "Notify Finance", status: "Sent 🔔" },
                { text: "Open Req for Junior AM", type: "INTERNAL", route: "Notify HR", status: "Sent 🔔" }
            ],
            minutes: "Discussed churn risks in North region. Action plan agreed for TechNova. Personnel gaps identified in Mumbai."
        } : {
            actions: [
                { text: "Fix Export Button Ref#500", type: "EXTERNAL", route: "Jira Ticket", status: "Created 🎫 (J-1042)" },
                { text: "Prepare Enterprise Contract", type: "EXTERNAL", route: "Salesforce Task", status: "Created ✅" }
            ],
            minutes: "Client reported bug in reporting module. Expressed interest in Enterprise upgrade. Contract amendment required."
        });

        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-mono p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-green-400">⚡ Nexus AI Simulator</h1>
                        <p className="text-gray-400 text-sm">Visualize the backend intelligence pipeline</p>
                    </div>
                    <Link href="/dashboard/am" className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition-colors">
                        ← Back to Dashboard
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT: Input Control */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <h2 className="text-lg font-bold mb-4 text-white">1. Select Scenario</h2>
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setScenario("INTERNAL")}
                                    className={`flex-1 py-3 px-4 rounded border font-medium transition-all ${scenario === "INTERNAL"
                                            ? "bg-slate-700 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20"
                                            : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                                        }`}
                                >
                                    🏢 Internal Review
                                </button>
                                <button
                                    onClick={() => setScenario("EXTERNAL")}
                                    className={`flex-1 py-3 px-4 rounded border font-medium transition-all ${scenario === "EXTERNAL"
                                            ? "bg-slate-700 border-green-500 text-green-300 shadow-lg shadow-green-500/20"
                                            : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                                        }`}
                                >
                                    🤝 Client Call
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source Transcript</label>
                                <div className="w-full h-48 bg-black p-4 rounded border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap overflow-y-auto">
                                    {DEMO_SCENARIOS[scenario].transcript}
                                </div>
                            </div>

                            <button
                                onClick={runSimulation}
                                disabled={isProcessing}
                                className={`w-full py-4 rounded font-bold text-lg transition-all ${isProcessing
                                        ? "bg-gray-700 text-gray-500 cursor-wait"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                                    }`}
                            >
                                {isProcessing ? "Processing..." : "▶ Run AI Pipeline"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Output Console */}
                    <div className="space-y-6">
                        {/* System Logs */}
                        <div className="bg-black p-6 rounded-lg border border-gray-700 h-64 overflow-y-auto font-mono text-sm shadow-inner">
                            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-black pb-2 border-b border-gray-800">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-gray-500">System Logs</span>
                            </div>

                            {logs.length === 0 && !isProcessing && (
                                <p className="text-gray-600 italic">Waiting for input...</p>
                            )}

                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 animate-pulse-short">
                                    {log.includes('Scope') ? <span className="text-purple-400">{log}</span> :
                                        log.includes('Action') ? <span className="text-yellow-400">{log}</span> :
                                            log.includes('Routing') ? <span className="text-blue-400">{log}</span> :
                                                <span className="text-gray-300">{log}</span>}
                                </div>
                            ))}
                            {isProcessing && <div className="mt-2 text-green-500 animate-pulse">_</div>}
                        </div>

                        {/* Final Output Card */}
                        {results && (
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-fade-in-up">
                                <h3 className="text-green-400 font-bold mb-4 uppercase text-xs tracking-wider">Generated Output</h3>

                                <div className="mb-4">
                                    <h4 className="text-gray-400 text-xs mb-1">Generated Minutes</h4>
                                    <p className="text-gray-200 text-sm border-l-2 border-gray-600 pl-3">{results.minutes}</p>
                                </div>

                                <div>
                                    <h4 className="text-gray-400 text-xs mb-2">Routed Actions</h4>
                                    <div className="space-y-2">
                                        {results.actions.map((action: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-700">
                                                <span className="text-sm font-medium">{action.text}</span>
                                                <span className={`text-xs px-2 py-1 rounded border ${action.type === 'INTERNAL'
                                                        ? 'bg-purple-900/30 text-purple-300 border-purple-800'
                                                        : 'bg-blue-900/30 text-blue-300 border-blue-800'
                                                    }`}>
                                                    {action.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
