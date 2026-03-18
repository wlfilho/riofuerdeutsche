import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import MembersHeader from '@/components/members/MembersHeader';
import { createClient } from '@/utils/supabase/server';

export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMembershipAccess();

  if (!access.isAuthenticated) {
    redirect('/login?redirect=/guide');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userName = access.firstName || (user?.email ? user.email.split('@')[0] : 'User');
  const userPlan = access.isPremium ? 'premium' : 'free';

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col">
      <MembersHeader userName={userName} userPlan={userPlan} />

      {/* children ocupam largura total — a hero vai de borda a borda */}
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}
