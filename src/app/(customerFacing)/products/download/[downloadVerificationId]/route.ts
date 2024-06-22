import prisma from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";

export async function GET(
    req: NextRequest,
    {
        params: { donwloadVerificationId },
    }: { params: { donwloadVerificationId: string } }
) {
    const data = await prisma.downloadVerification.findFirst({
        where: { id: donwloadVerificationId, expiresAt: { gt: new Date() } },
        select: { product: { select: { filePath: true, name: true } } },
    });

    if (!data) {
        return NextResponse.redirect(
            new URL("/products/download/expired", req.url)
        );
    }

    const { size } = await fs.stat(data.product.filePath);
    const file = await fs.readFile(data.product.filePath);
    const extension = data.product.filePath.split(".").pop();

    return new NextResponse(file, {
        headers: {
            "Content-Disposition": `attachment; filename=${data.product.name}.${extension}`,
            "Content-Length": size.toString(),
        },
    });
}
