import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get("Stripe-Signature") || "";

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error("Webhook签名验证失败:", error);
        return NextResponse.json(
            { error: "Webhook签名验证失败" },
            { status: 400 }
        );
    }

    // 处理支付成功事件
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, points } = paymentIntent.metadata;

        try {
            // 更新用户积分 - 实际实现将取决于您的数据库和ORM
            // await db.update(userTable)
            //   .set({ points: sql`points + ${parseInt(points)}` })
            //   .where(eq(userTable.id, userId));

            // 记录交易记录
            // await db.insert(transactionTable).values({
            //   userId,
            //   points: parseInt(points),
            //   amount: paymentIntent.amount / 100,
            //   paymentIntentId: paymentIntent.id,
            //   createdAt: new Date(),
            // });
        } catch (error) {
            console.error("处理支付成功事件失败:", error);
            return NextResponse.json(
                { error: "处理支付成功事件失败" },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ received: true });
}