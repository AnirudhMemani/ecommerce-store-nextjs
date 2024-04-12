"use server";

import prisma from "@/db/db";
import { notFound } from "next/navigation";

export async function deleteUser(id: string) {
    const user = await prisma.user.delete({
        where: { id },
    });

    if (!user) {
        return notFound();
    }

    return user;
}
