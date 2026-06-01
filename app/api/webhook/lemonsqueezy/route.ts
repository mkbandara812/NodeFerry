import crypto from "crypto";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    const signature = req.headers.get("x-signature");
    const rawBody = await req.text();

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature || "", "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      return new NextResponse("No user_id in custom_data", { status: 200 });
    }

    const client = await clerkClient();

    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      const status = payload.data.attributes.status;
      const customerPortalUrl = payload.data.attributes.urls?.customer_portal;

      if (status === "active" || status === "past_due") {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPro: true,
            customerPortalUrl: customerPortalUrl || null,
          },
        });
      } else if (status === "expired" || status === "cancelled" || status === "unpaid") {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPro: false,
            customerPortalUrl: null,
          },
        });
      }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
       await client.users.updateUserMetadata(userId, {
         publicMetadata: {
           isPro: false,
           customerPortalUrl: null,
         },
       });
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
