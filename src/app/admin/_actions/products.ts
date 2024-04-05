"use server";
import prisma from "@/db/db";
import z from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";

const fileSchema = z.instanceof(File, { message: "Required" });

const imageScehma = fileSchema.refine(
    (file) => file.size === 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInCents: z.coerce.number().int().min(1),
    file: fileSchema.refine((file) => file.size > 0, "Required"),
    image: imageScehma.refine((file) => file.size > 0, "Required"),
});

export async function addProducts(prevState: unknown, formData: FormData) {
    const productObject = Object.fromEntries(formData.entries());

    const result = addSchema.safeParse(productObject);

    if (!result.success) {
        return result.error.formErrors.fieldErrors;
    }

    const productData = result.data;

    await fs.mkdir("products", { recursive: true });
    const filePath = `products/${crypto.randomUUID()}~${productData.file.name}`;
    await fs.writeFile(
        filePath,
        Buffer.from(await productData.file.arrayBuffer())
    );

    await fs.mkdir("public/products", { recursive: true });
    const imagePath = `/products/${crypto.randomUUID()}~${
        productData.image.name
    }`;
    await fs.writeFile(
        `public${imagePath}`,
        Buffer.from(await productData.image.arrayBuffer())
    );

    await prisma.product.create({
        data: {
            isAvailableForPurchase: false,
            name: productData.name,
            description: productData.description,
            priceInCents: productData.priceInCents,
            filePath,
            imagePath,
        },
    });

    redirect("/admin/products");
}

export async function toggleProductAvailability(
    id: string,
    isAvailableForPurchase: boolean
) {
    await prisma.product.update({
        where: { id },
        data: {
            isAvailableForPurchase,
        },
    });
}

export async function deleteProduct(id: string) {
    const product = await prisma.product.delete({
        where: { id },
    });

    if (!product) {
        notFound();
    }

    await Promise.all([
        fs.unlink(product.filePath),
        fs.unlink(`public/${product.imagePath}`),
    ]);
}
