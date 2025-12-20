
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

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
                try {
                    const email = credentials?.email as string;
                    const password = credentials?.password as string;

                    console.log("DEBUG: authorize called with", { email });

                    if (!email || !password) {
                        console.log("DEBUG: Missing email or password");
                        return null;
                    }

                    const user = await prisma.user.findUnique({ where: { email } });

                    // If user doesn't exist or has no password (e.g. Google-only user tried password login)
                    if (!user || !user.password) {
                        console.log("DEBUG: User not found or no password", user ? user.email : "No user");
                        return null;
                    }

                    const isValid = await bcrypt.compare(password, user.password);

                    if (isValid) {
                        return user;
                    }

                    console.log("DEBUG: Invalid password for", user.email);
                    return null;
                } catch (error) {
                    console.error("DEBUG: Authorize error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            try {
                if (user) {
                    token.id = user.id;
                    // @ts-expect-error is_super_admin not in default User type
                    token.is_super_admin = user.is_super_admin;

                    // Fetch Roles locally if new login
                    try {
                        const roles = await prisma.userRole.findMany({
                            where: { user_id: user.id },
                            include: { role: true, company: true }
                        });

                        // @ts-ignore
                        token.roles = roles.map(r => ({
                            name: r.role.name,
                            company: r.company?.domain_name
                        }));
                    } catch (roleError) {
                        console.error("DEBUG: Error fetching roles:", roleError);
                        // Continue without roles if DB fetch fails
                        token.roles = [];
                    }
                }

                // Optional: Update token if session is updated (trigger === "update")
                if (trigger === "update" && session) {
                    token = { ...token, ...session };
                }
            } catch (error) {
                console.error("DEBUG: JWT Callback Error:", error);
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
