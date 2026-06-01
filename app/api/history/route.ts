import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { filename, sizeBytes, status } = await req.json();

    const { error } = await supabase
      .from('transfers')
      .insert([
        { 
          user_id: userId, 
          filename, 
          size_bytes: sizeBytes, 
          status 
        }
      ]);

    if (error) {
      console.error('Error logging transfer:', error);
      return new NextResponse('Database Error', { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('History API error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
