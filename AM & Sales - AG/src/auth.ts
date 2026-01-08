
// Mock Auth configuration for Internal Module
import { NextRequest, NextResponse } from "next/server";

export const auth = (req: NextRequest) => {
    // Pass-through for development/demo
    return NextResponse.next();
};

export const signIn = () => { };
export const signOut = () => { };
export const handlers = { GET: () => { }, POST: () => { } };
