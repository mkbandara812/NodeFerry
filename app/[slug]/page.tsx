import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import MainApp from '@/components/MainApp';

export default async function CustomVanityPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch brand data from Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('logo_url, background_url, user_id')
    .eq('vanity_url', slug)
    .single();

  if (error || !profile) {
    notFound();
  }

  // We load the Client Component and pass the branding props
  return (
    <MainApp 
        initialRoomId={slug}
        customLogoUrl={profile.logo_url}
        customBackgroundUrl={profile.background_url}
    />
  );
}
