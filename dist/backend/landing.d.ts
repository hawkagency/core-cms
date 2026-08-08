import { SupabaseClient } from '@supabase/supabase-js';
export interface BannerConfig {
    isActive: boolean;
    message: string;
    type: 'avviso' | 'info' | 'urgente';
}
export interface Promotion {
    id: string | number;
    title: string;
    heading: string;
    highlight: string;
    timer: boolean;
    description: string;
    link: string;
    iconName: string;
}
export interface FeaturedItems {
    courses: string[];
    memberships: string[];
    staff: string[];
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
export declare function getLandingSettings(supabase: SupabaseClient, tenantId?: string): Promise<CmsLandingSettings>;
export declare function updateLandingSettings(supabase: SupabaseClient, tenantId: string, payload: Partial<Omit<CmsLandingSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): Promise<CmsLandingSettings>;
