'use client';

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"



export function CredentialsLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, // Prevent automatic redirect
            });

            if (result?.error) {
                // Handle login error
                setError("Invalid email or password");
            } else {
                // Successful login
                window.location.href = "/"; // Manual redirect
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError("Something went wrong");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign In
            </button>
            {error && (
                <div className="text-red-500 text-sm text-center">
                    {error}
                </div>
            )}
        </form>
    )
}

export function DevLogin() {
    return (
        <button
            onClick={() => signIn("credentials", { email: "nikhil@example.com", password: "password123", callbackUrl: "/" })}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition w-full"
        >
            Dev Login (Nikhil)
        </button>
    )
}
