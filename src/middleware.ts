import { NextRequest, NextResponse } from "next/server";
import { isValidPassword } from "./lib/isValidPassword";

export async function middleware(req: NextRequest) {
    const authenticated = await isAuthentication(req);

    if (!authenticated) {
        return new NextResponse("Unauthorized", {
            status: 401,
            headers: {
                "WWW-Authenticate": "Basic",
            },
        });
    }
}

async function isAuthentication(req: NextRequest): Promise<boolean> {
    const authHeader =
        req.headers.get("authorization") || req.headers.get("Authorization");

    if (!authHeader) {
        return false;
    }

    /**
     * The authHeader will look something like "Base jsakhdjkasd"
     * We take the second base64 encoded value and decode it using toString()
     * and the the result would look like username:password, so we split it using ":" and get the username and password as a tuple
     */
    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
        .toString()
        .split(":");

    return (
        username === process.env.ADMIN_USERNAME &&
        (await isValidPassword(
            password,
            process.env.HASHED_ADMIN_PASSWORD ||
                "$2a$10$ddPGpWtRxpdbnrbX8kARg.P13igMACpfYp6yPRc/BRDk4tKAH8Bqi"
        ))
    );
}

export const config = {
    matcher: "/admin/:path*",
};
