// @webwaka/profiles — public profile management stub
export type ProfileType = 'individual' | 'organization' | 'workspace';

export interface PublicProfile {
  id: string;
  tenant_id: string;
  type: ProfileType;
  slug: string;
  display_name: string;
  bio?: string;
  place_id?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export function buildProfileSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
