import { supabase } from "./supabase";

export async function registerPush() {
  if (!("serviceWorker" in navigator)) return;
  if (!("PushManager" in window)) return;

  const registration = await navigator.serviceWorker.register("/service-worker.js");

  const { data: keyData } = await supabase.functions.invoke("get-public-vapid-key");

  const vapidPublicKey = keyData.publicKey;
  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  let subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  });

  await supabase.from("push_subscriptions").insert([
    {
      subscription: subscription.toJSON(),
    },
  ]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
