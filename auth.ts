
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google,
        // For Development: Allow signing in as "Nikhil" without real Google Creds
        Credentials({
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                console.log("DEBUG: authorize called with", { email, password });

                if (!email || !password) {
                    console.log("DEBUG: Missing email or password");
                    return null;
                }

                const user = await prisma.user.findUnique({ where: { email } }) as any;

                // If user doesn't exist or has no password (e.g. Google-only user tried password login)
                if (!user || !user.password) {
                    console.log("DEBUG: User not found or no password", user ? user.email : "No user");
                    return null;
                }

                // Verify password



                const bcrypt = await import("bcryptjs");
                const isValid = await bcrypt.compare(password, user.password);

                if (isValid) {
                    console.log("DEBUG: Password valid for", user.email);
                    return user;
                }

                console.log("DEBUG: Invalid password for", user.email);
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.is_super_admin = user.is_super_admin;

                // Fetch Roles locally if new login
                const roles = await prisma.userRole.findMany({
                    where: { user_id: user.id },
                    include: { role: true, company: true }
                });

                // @ts-ignore
                token.roles = roles.map(r => ({
                    name: r.role.name,
                    company: r.company?.domain_name
                }));
            }

            // Optional: Update token if session is updated (trigger === "update")
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.is_super_admin = token.is_super_admin;
                // @ts-ignore
                session.user.roles = token.roles;
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: '/'
    }
})
