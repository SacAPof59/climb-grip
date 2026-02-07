// lib/utils/profileCheck.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/authOptions';
import { getUserProfile } from '@/lib/services/profileService';

export async function requireProfile() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return { hasProfile: false, needsAuth: true, user: null };
  }

  const user = await getUserProfile(session.user.email);
  
  if (!user) {
    return { hasProfile: false, needsAuth: true, user: null };
  }

  // Check if user has a complete climber profile
  const hasProfile = user.climber !== null;
  
  return { 
    hasProfile, 
    needsAuth: false, 
    user,
    needsProfile: !hasProfile 
  };
}
