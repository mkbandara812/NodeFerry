import { createCheckout, lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    const { variantId } = await req.json();

    if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID) {
      console.error("Missing Lemon Squeezy environment variables");
      return new NextResponse("Server Configuration Error", { status: 500 });
    }

    lemonSqueezySetup({
      apiKey: process.env.LEMONSQUEEZY_API_KEY,
      onError: (error) => console.error("Lemon Squeezy Setup Error:", error),
    });

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    
    // Convert variantId to number or string depending on what createCheckout expects.
    // The LemonSqueezy SDK expects string IDs for store and variant.
    const checkout = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: email || undefined,
        custom: {
          user_id: userId,
        },
      },
    });

    if (checkout.error) {
      console.error("Lemon Squeezy Checkout Error:", checkout.error);
      return new NextResponse("Failed to create checkout", { status: 500 });
    }

    const url = checkout.data?.data.attributes.url;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
