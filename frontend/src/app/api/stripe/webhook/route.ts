export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
    const body = await req.text();
    const reqHeaders = await headers();
    const signature = reqHeaders.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.customer) {
            return new NextResponse("No customer connected to session", { status: 400 });
        }

        const user = await db.user.update({
            where: {
                stripeCustomerId: session.customer as string,
            },
            data: {
                plan: "StreamVault+",
            },
        });

        await db.subscription.create({
            data: {
                userId: user.id,
                plan: "StreamVault+",
                status: "ACTIVE",
                stripeSessionId: subscription.id,
                endDate: new Date((subscription as any).current_period_end * 1000),
            }
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            await db.subscription.updateMany({
                where: {
                    stripeSessionId: subscription.id,
                },
                data: {
                    status: "ACTIVE",
                    endDate: new Date((subscription as any).current_period_end * 1000),
                },
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
