import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Usually you'd fetch the Stripe customer, or create one if it doesn't exist
        let customerId = user.stripeCustomerId;

        if (!customerId) {
            // We mock Stripe customer creation here based on dummy API Keys. 
            // In reality, this requires valid keys.
            // For local development without real keys, we will mock the redirect URL.
            if (process.env.STRIPE_SECRET_KEY?.includes("mock")) {
                return NextResponse.json({ url: `${process.env.NEXTAUTH_URL}/browse?success=true` });
            }

            const customer = await stripe.customers.create({
                email: user.email,
            });

            customerId = customer.id;

            await db.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Mock stripe behavior for mocked keys
        if (process.env.STRIPE_SECRET_KEY?.includes("mock")) {
            return NextResponse.json({ url: `${process.env.NEXTAUTH_URL}/browse?success=true` });
        }

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            customer: customerId!,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "StreamVault Premium",
                        },
                        unit_amount: 399,
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/browse?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`,
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
