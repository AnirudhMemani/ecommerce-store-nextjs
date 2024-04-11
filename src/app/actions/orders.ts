"use server";

import prisma from "@/db/db";

export async function userOrderExists(
    email: string,
    productId: string
): Promise<boolean> {
    return (
        (await prisma.order.findFirst({
            where: { user: { email }, productId },
            select: { id: true },
        })) != null
    );
}
