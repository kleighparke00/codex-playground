import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const authorization = request.headers.get('Authorization');
  if (!authorization) return new Response('Unauthorized', { status: 401 });

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL');
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { entryId } = await request.json();
  const admin = createClient(url, serviceKey);
  const { data: entry } = await admin.from('water_entries').select('id,user_id,amount_oz').eq('id', entryId).eq('user_id', user.id).single();
  if (!entry) return new Response('Entry not found', { status: 404 });
  const [{ data: actor }, { data: recipients }] = await Promise.all([
    admin.from('profiles').select('display_name').eq('id', user.id).single(),
    admin.from('profiles').select('email').neq('id', user.id)
  ]);
  if (!actor || !recipients?.length) return Response.json({ sent: 0 });

  const deliveries = await Promise.all(recipients.map(({ email }) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail, to: [email],
      subject: `${actor.display_name} just made a splash 💧`,
      text: `${actor.display_name} added ${entry.amount_oz} oz of water. Open Sip Circle to see how the team is flowing.`
    })
  })));
  const sent = deliveries.filter((delivery) => delivery.ok).length;
  return Response.json({ sent }, { status: sent === recipients.length ? 200 : 502 });
});
