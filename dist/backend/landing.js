"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLandingSettings = getLandingSettings;
exports.updateLandingSettings = updateLandingSettings;
const DEFAULT_BANNER = { isActive: false, message: '', type: 'info' };
const DEFAULT_PROMOS = [];
const DEFAULT_FEATURED = { courses: [], memberships: [], staff: [] };
async function getLandingSettings(supabase, tenantId) {
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
            }
            else if (insertErr) {
                console.error('Failed to create default CMS settings:', insertErr);
            }
        }
        catch (err) {
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
    return data;
}
async function updateLandingSettings(supabase, tenantId, payload) {
    const existing = await getLandingSettings(supabase, tenantId);
    const cleanPayload = { updated_at: new Date().toISOString() };
    if (payload.banner_config !== undefined)
        cleanPayload.banner_config = payload.banner_config;
    if (payload.promotions_config !== undefined)
        cleanPayload.promotions_config = payload.promotions_config;
    if (payload.featured_items !== undefined)
        cleanPayload.featured_items = payload.featured_items;
    if (existing.id) {
        const { data, error } = await supabase
            .from('cms_landing_settings')
            .update(cleanPayload)
            .eq('id', existing.id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    else {
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
        if (error)
            throw error;
        return data;
    }
}
