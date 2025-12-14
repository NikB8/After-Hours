'use server'

console.log("DEBUG: app/actions.ts loaded");

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function testAction() {
    console.log("DEBUG: testAction called on server");
    console.log("DEBUG: signIn imported:", !!signIn);
    return "Test Action Success";
}

export async function dummyAction(prevState: any, formData: FormData) {
    console.log("DEBUG: dummyAction called on server");
    return "Dummy Success";
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email')
        const password = formData.get('password')
        console.log("DEBUG: authenticate action called with", { email, password })

        // Use redirect: false to prevent throwing NEXT_REDIRECT
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        })

        console.log("DEBUG: signIn result on server:", result)

        if (result?.error) {
            return "Invalid credentials."
        }

        return "success"
    } catch (error) {
        console.log("DEBUG: authenticate error", error)
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}
