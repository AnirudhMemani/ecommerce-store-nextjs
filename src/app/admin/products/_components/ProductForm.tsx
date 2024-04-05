"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { useState } from "react";
import { addProducts, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Product } from "@prisma/client";
import Image from "next/image";

export function ProductForm({ product }: { product?: Product | null }) {
    const [priceInCents, setPriceInCents] = useState<number | undefined>(
        product?.priceInCents
    );
    const [file, setFile] = useState<FileList | null>(null);
    const [error, action] = useFormState(
        product == null ? addProducts : updateProduct.bind(null, product.id),
        {}
    );

    return (
        <form
            className="space-y-8"
            action={action}
        >
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={product?.name || ""}
                />
                {error.name && (
                    <div className="text-destructive">{error.name}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="priceInCents">Price In Cents</Label>
                <Input
                    type="number"
                    id="priceInCents"
                    name="priceInCents"
                    required
                    value={priceInCents}
                    onChange={(e) =>
                        setPriceInCents(Number(e.target.value) || undefined)
                    }
                />
                {error.priceInCents && (
                    <div className="text-destructive">{error.priceInCents}</div>
                )}
                <div className="text-muted-foreground">
                    {formatCurrency((priceInCents || 0) / 100)}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={product?.description || ""}
                ></Textarea>
                {error.description && (
                    <div className="text-destructive">{error.description}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                    type="file"
                    id="file"
                    name="file"
                    className="cursor-pointer file:cursor-pointer"
                    multiple={false}
                    onChange={(e) => setFile(e.target.files)}
                    required={product == null}
                />
                {product != null && file == null && (
                    <div className="text-muted-foreground">
                        {product.filePath.split("/")[1]}
                    </div>
                )}
                {error.file && (
                    <div className="text-destructive">{error.file}</div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                    type="file"
                    id="image"
                    name="image"
                    className="cursor-pointer file:cursor-pointer"
                    accept=".jpg, .png, .jpeg, .webp"
                    required={product == null}
                />
                {product != null && (
                    <Image
                        src={product.imagePath}
                        height={400}
                        width={400}
                        alt="Product Image"
                    />
                )}
                {error.image && (
                    <div className="text-destructive">{error.image}</div>
                )}
            </div>
            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className={"!disabled:cursor-not-allowed"}
        >
            {pending ? "Saving..." : "Save"}
        </Button>
    );
}
