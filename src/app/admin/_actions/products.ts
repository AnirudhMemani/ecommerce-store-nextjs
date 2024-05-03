"use server";

import prisma from "@/db/db";
import z from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

const editSchema = addSchema.extend({
    file: fileSchema.optional(),
    image: imageScehma.optional(),
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
    //

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

    revalidatePath("/");
    revalidatePath("/products");

    redirect("/admin/products");
}

export async function updateProduct(
    id: string,
    prevState: unknown,
    formData: FormData
) {
    const productObject = Object.fromEntries(formData.entries());

    const result = editSchema.safeParse(productObject);

    if (!result.success) {
        return result.error.formErrors.fieldErrors;
    }

    const productData = result.data;

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        return notFound();
    }

    let filePath = product.filePath;
    if (productData.file != null && productData.file.size > 0) {
        await fs.unlink(product.filePath);

        filePath = `products/${crypto.randomUUID()}~${productData.file.name}`;

        await fs.writeFile(
            filePath,
            Buffer.from(await productData.file.arrayBuffer())
        );
    }

    let imagePath = product.imagePath;
    if (productData.image != null && productData.image.size > 0) {
        await fs.unlink(`public${product.imagePath}`);

        imagePath = `/products/${crypto.randomUUID()}~${
            productData.image.name
        }`;

        await fs.writeFile(
            `public${imagePath}`,
            Buffer.from(await productData.image.arrayBuffer())
        );
    }

    await prisma.product.update({
        where: { id },
        data: {
            name: productData.name,
            description: productData.description,
            priceInCents: productData.priceInCents,
            filePath,
            imagePath,
        },
    });

    revalidatePath("/");
    revalidatePath("/products");

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

    revalidatePath("/");
    revalidatePath("/products");
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

    revalidatePath("/");
    revalidatePath("/products");
}
