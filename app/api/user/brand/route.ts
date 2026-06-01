import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const { brandName } = await req.json();
    const client = await clerkClient();
    
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        brandName
      }
    });
    
    return NextResponse.json({ success: true, brandName });
  } catch (error) {
    console.error('Error updating brand:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
