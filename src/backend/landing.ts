import { SupabaseClient } from '@supabase/supabase-js';

export interface BannerConfig {
  isActive: boolean;
  message: string;
  type: 'avviso' | 'info' | 'urgente' | 'promozione';
}

export interface Promotion {
  id: string | number;
  title: string;
  heading: string;
  highlight: string;
  timer: boolean;
  description: string;
  link: string;
  iconName: string; // Stored as a string to decouple from frontend React components
}

export interface FeaturedItems {
  courses: string[]; // UUIDs of course_templates
  memberships: string[]; // UUIDs of membership_plans
  staff: string[]; // UUIDs of profiles (trainers)
  recommended_membership?: string; // UUID of the membership to highlight
}

export interface CmsLandingSettings {
  id: string;
  tenant_id: string;
  banner_config: BannerConfig;
  promotions_config: Promotion[];
  featured_items: FeaturedItems;
  created_at: string;
  updated_at: string;
}

const DEFAULT_BANNER: BannerConfig = { isActive: false, message: '', type: 'info' };
const DEFAULT_PROMOS: Promotion[] = [];
const DEFAULT_FEATURED: FeaturedItems = { courses: [], memberships: [], staff: [] };

export async function getLandingSettings(
  supabase: SupabaseClient,
  tenantId: string = 'mythos'
): Promise<CmsLandingSettings> {
  let { data, error } = await supabase
    .from('cms_landing_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching CMS landing settings:', error);
  }

  // Auto-inizializzazione se non esiste la riga per questo tenant
  if (!data) {
    try {
      const { data: created, error: insertErr } = await supabase
        .from('cms_landing_settings')
        .insert({
          tenant_id: tenantId,
          banner_config: DEFAULT_BANNER,
          promotions_config: DEFAULT_PROMOS,
          featured_items: DEFAULT_FEATURED
        })
        .select()
        .maybeSingle();

      if (!insertErr && created) {
        data = created;
      } else if (insertErr) {
        console.error('Failed to create default CMS settings:', insertErr);
      }
    } catch (err) {
      console.error('Auto-initialization exception:', err);
    }
  }

  // Nel caso il DB fallisse, ritorniamo comunque una struttura valida
  if (!data) {
    return {
      id: '',
      tenant_id: tenantId,
      banner_config: DEFAULT_BANNER,
      promotions_config: DEFAULT_PROMOS,
      featured_items: DEFAULT_FEATURED,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as CmsLandingSettings;
}

export async function updateLandingSettings(
  supabase: SupabaseClient,
  tenantId: string,
  payload: Partial<Omit<CmsLandingSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
): Promise<CmsLandingSettings> {
  const existing = await getLandingSettings(supabase, tenantId);

  const cleanPayload: any = { updated_at: new Date().toISOString() };
  if (payload.banner_config !== undefined) cleanPayload.banner_config = payload.banner_config;
  if (payload.promotions_config !== undefined) cleanPayload.promotions_config = payload.promotions_config;
  if (payload.featured_items !== undefined) cleanPayload.featured_items = payload.featured_items;

  if (existing.id) {
    const { data, error } = await supabase
      .from('cms_landing_settings')
      .update(cleanPayload)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data as CmsLandingSettings;
  } else {
    // Should never happen since getLandingSettings initializes it
    const { data, error } = await supabase
      .from('cms_landing_settings')
      .insert({
        tenant_id: tenantId,
        banner_config: payload.banner_config || DEFAULT_BANNER,
        promotions_config: payload.promotions_config || DEFAULT_PROMOS,
        featured_items: payload.featured_items || DEFAULT_FEATURED,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CmsLandingSettings;
  }
}
