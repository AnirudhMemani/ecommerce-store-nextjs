"use client";

import { userOrderExists } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    Elements,
    LinkAuthenticationElement,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";

type CheckoutFormProps = {
    product: {
        id: string;
        imagePath: string;
        name: string;
        priceInCents: number;
        description: string;
    };
    clientSecret: string;
};

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export function CheckoutForm({ clientSecret, product }: CheckoutFormProps) {
    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <div className="flex gap-4 items-center">
                <div className="aspect-video flex-shrink-0 w-1/3 relative">
                    <Image
                        src={product.imagePath}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <div className="text-lg">
                        {formatCurrency(product.priceInCents / 100)}
                    </div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                </div>
            </div>
            <Elements
                options={{ clientSecret }}
                stripe={stripePromise}
            >
                <Form
                    priceInCents={product.priceInCents}
                    productId={product.id}
                />
            </Elements>
        </div>
    );
}

function Form({
    priceInCents,
    productId,
}: {
    priceInCents: number;
    productId: string;
}) {
    // gives us the stripe isntance
    const stripe = useStripe();
    // has all the details for payment info, emails etc.
    const elements = useElements();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [email, setEmail] = useState<string>();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!stripe || !elements || !email) {
            return;
        }

        setIsLoading(true);

        const orderExists = await userOrderExists(email, productId);

        if (orderExists) {
            setErrorMessage(
                "You have already purchased this product. Try downloading it from My Orders page"
            );
            setIsLoading(false);
            return;
        }

        stripe
            .confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
                },
            })
            .then(({ error }) => {
                if (
                    error.type === "card_error" ||
                    error.type === "validation_error"
                ) {
                    setErrorMessage(error.message);
                } else {
                    console.log(error);
                    setErrorMessage("An unknown error occured");
                }
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    {errorMessage && (
                        <CardDescription className="text-destructive">
                            {errorMessage}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <PaymentElement />
                    <div className="mt-2">
                        <LinkAuthenticationElement
                            onChange={(e) => setEmail(e.value.email)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className={cn(
                            "w-full",
                            isLoading && "pointer-events-none"
                        )}
                        size="lg"
                        disabled={!stripe || !elements || isLoading}
                    >
                        {isLoading ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            `Purchase - ${formatCurrency(priceInCents / 100)}`
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
