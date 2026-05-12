import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Did you copy .env.example to .env.local and fill in the values?",
  );
}

// Browser-side client. Uses the anon key. Read-only access for the demo.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper for calling the Hunter Edge Function
export async function askHunter(
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<{
  answer: string;
  citations: Array<{ doc_id: string; title: string }>;
}> {
  const url = `${supabaseUrl}/functions/v1/hunter`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ question, history }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hunter function failed: ${res.status} ${text}`);
  }

  return res.json();
}
