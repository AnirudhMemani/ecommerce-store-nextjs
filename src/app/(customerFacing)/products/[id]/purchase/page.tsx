import prisma from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        return notFound();
    }

    const customer = await stripe.customers.create({
        name: "Customer",
        address: {
            line1: "510 Townsend St",
            postal_code: "98140",
            city: "San Francisco",
            state: "CA",
            country: "US",
        },
    });

    const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        amount: product.priceInCents,
        currency: "USD",
        description: "Digital product",
        metadata: { productId: product.id },
    });

    if (!paymentIntent.client_secret) {
        throw Error("Stripe failed to create payment intent");
    }

    return (
        <CheckoutForm
            product={product}
            clientSecret={paymentIntent.client_secret}
        />
    );
}
