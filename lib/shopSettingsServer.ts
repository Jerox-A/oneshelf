import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function getShopSettings() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("shop_settings")
    .select("shop_name, currency_code, setup_completed")
    .eq("owner_id", user.id)
    .maybeSingle();

  return data;
}

export async function getShopCurrencyCode() {
  const settings = await getShopSettings();

  return settings?.currency_code || "USD";
}