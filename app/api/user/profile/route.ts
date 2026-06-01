import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const brandName = formData.get('brandName') as string;
    const vanityUrl = formData.get('vanityUrl') as string;
    const logoFile = formData.get('logo') as File;
    const bgFile = formData.get('background') as File;

    let logoUrl = '';
    let backgroundUrl = '';

    // Upload Logo
    if (logoFile && logoFile.size > 0) {
      const { data, error } = await supabase.storage
        .from('branding')
        .upload(`${userId}/logo-${Date.now()}`, logoFile, { upsert: true });
      if (!error && data) {
        logoUrl = supabase.storage.from('branding').getPublicUrl(data.path).data.publicUrl;
      }
    }

    // Upload Background
    if (bgFile && bgFile.size > 0) {
      const { data, error } = await supabase.storage
        .from('branding')
        .upload(`${userId}/bg-${Date.now()}`, bgFile, { upsert: true });
      if (!error && data) {
        backgroundUrl = supabase.storage.from('branding').getPublicUrl(data.path).data.publicUrl;
      }
    }

    // Upsert into Profiles table
    const updatePayload: any = {};
    if (vanityUrl) updatePayload.vanity_url = vanityUrl;
    if (logoUrl) updatePayload.logo_url = logoUrl;
    if (backgroundUrl) updatePayload.background_url = backgroundUrl;

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, ...updatePayload }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Supabase Error:', error);
        return new NextResponse('Failed to update profile', { status: 500 });
      }
    }

    // Update Clerk Metadata for quick access
    if (brandName || vanityUrl) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          brandName: brandName || undefined,
          vanityUrl: vanityUrl || undefined
        }
      });
    }

    return NextResponse.json({ success: true, logoUrl, backgroundUrl });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
