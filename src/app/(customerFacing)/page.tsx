import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import prisma from "@/db/db";
import { cache } from "@/lib/cache";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const REVALIDATION_TIME = 60 * 60 * 24;

const getMostPopulatProducts = cache(
    async () => {
        return await prisma.product.findMany({
            where: { isAvailableForPurchase: true },
            orderBy: { orders: { _count: "desc" } },
            take: 6,
        });
    },
    ["/", "getMostPopulatProducts"],
    { revalidate: REVALIDATION_TIME }
);

const getNewestProducts = cache(async () => {
    return await prisma.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { createdAt: "desc" },
        take: 6,
    });
}, ["/", "getNewestProducts"]);

export default function HomePage() {
    return (
        <main className="space-y-12">
            <ProductGridSection
                productsFetcher={getMostPopulatProducts}
                title="Most Popular"
            ></ProductGridSection>
            <ProductGridSection
                productsFetcher={getNewestProducts}
                title="Newest"
            ></ProductGridSection>
        </main>
    );
}

type ProductGridSectionProps = {
    productsFetcher: () => Promise<Product[]>;
    title: string;
};

function ProductGridSection({
    productsFetcher,
    title,
}: ProductGridSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold">{title}</h2>
                <Button
                    asChild
                    variant="outline"
                >
                    <Link
                        href="/products"
                        className="space-x-2"
                    >
                        <span>View All</span>
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Suspense
                    fallback={
                        <>
                            <ProductCardSkeleton />
                            <ProductCardSkeleton />
                            <ProductCardSkeleton />
                        </>
                    }
                >
                    <ProductSuspense productsFetcher={productsFetcher} />
                </Suspense>
            </div>
        </div>
    );
}

async function ProductSuspense({
    productsFetcher,
}: Pick<ProductGridSectionProps, "productsFetcher">) {
    return (await productsFetcher()).map((product) => (
        <ProductCard
            key={product.id}
            {...product}
        />
    ));
}
