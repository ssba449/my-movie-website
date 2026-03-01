import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { plan } = body;

        if (plan !== "StreamVault+") {
            return new NextResponse("Invalid subscription plan", { status: 400 });
        }

        const userId = (session.user as any).id;

        // In a real app, this is where Stripe Checkout Session logic would go.
        // For now, we instantly upgrade the user in the database.
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: "StreamVault+",
                subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // +1 year
            }
        });

        return NextResponse.json({
            message: "Subscription upgraded successfully",
            subscriptionStatus: updatedUser.subscriptionStatus
        });

    } catch (error) {
        console.error("[SUBSCRIPTION_UPGRADE_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
