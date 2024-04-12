import prisma from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const event = stripe.webhooks.constructEvent(
        await req.text(),
        req.headers.get("stripe-signature") as string,
        process.env.STRIPE_WEBHOOK_SECRET_KEY as string
    );

    if (event.type === "charge.succeeded") {
        const charge = event.data.object;
        const productId = charge.metadata.productId;
        const email = charge.billing_details.email;
        const pricePaidInCents = charge.amount;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product || !email) {
            return new NextResponse("Bad Request", { status: 400 });
        }

        const userFields = {
            email,
            orders: { create: { productId, pricePaidInCents } },
        };

        const {
            orders: [order],
        } = await prisma.user.upsert({
            where: { email },
            create: userFields,
            update: userFields,
            select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
        });

        const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

        const downloadVerification = await prisma.downloadVerification.create({
            data: {
                productId,
                expiresAt: new Date(Date.now() + MILLISECONDS_PER_DAY),
            },
        });

        await resend.emails.send({
            from: `Support <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Order Confirmation",
            react: <h1>Hi</h1>,
        });
    }

    return new NextResponse();
}
