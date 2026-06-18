// ============================================================
//  Breech AS – Backend (Node + Express)
//  Oppgave: beskytte API-et og hente data fra Supabase.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// CORS: tillat at frontend (annen port) kan kalle API-et.
app.use(cors());
// Tolker JSON-body på innkommende forespørsler.
app.use(express.json());

// Klient 1: SERVICE ROLE-nøkkel – brukes til å hente data og
// verifisere token. Denne nøkkelen er hemmelig (kun i backend).
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Klient 2: ANON-nøkkel – brukes kun til selve innloggingen.
// persistSession: false fordi en server ikke skal huske én bruker.
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

// ------------------------------------------------------------
//  MIDDLEWARE: krever gyldig innlogging (JWT-token)
// ------------------------------------------------------------
// Kjøres FØR de beskyttede rutene. Hvis token mangler eller er
// ugyldig, stoppes forespørselen her med 401.
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Mangler token – du må logge inn.' });
  }

  // Supabase verifiserer at token er ekte og ikke utløpt.
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Ugyldig eller utløpt token.' });
  }

  req.user = data.user; // gjør brukeren tilgjengelig videre om ønskelig
  next();
}

// ------------------------------------------------------------
//  RUTE: Innlogging
//  POST /api/login   (åpen – dette er nettopp der man logger inn)
// ------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Backend-validering: begge felt må være med.
  if (!email || !password) {
    return res.status(400).json({ error: 'E-post og passord må fylles ut.' });
  }

  // Backend ber Supabase sjekke brukernavn/passord.
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return res.status(401).json({ error: 'Feil e-post eller passord.' });
  }

  // Vi sender KUN tokenet tilbake til frontend (ikke passordet).
  res.json({ access_token: data.session.access_token });
});

// ------------------------------------------------------------
//  RUTE 1: Hent alle kunder
//  GET /api/customers   (beskyttet)
// ------------------------------------------------------------
app.get('/api/customers', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, email, phone')
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ------------------------------------------------------------
//  RUTE 2: Hent alle ordrer for ÉN kunde
//  GET /api/customers/:id/orders   (beskyttet)
// ------------------------------------------------------------
app.get('/api/customers/:id/orders', requireAuth, async (req, res) => {
  const { id } = req.params;

  // Backend-validering: sjekk at id faktisk er en gyldig UUID
  // før vi spør databasen (hindrer rar input / unødvendige feil).
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: 'Ugyldig kunde-id.' });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id, appliance_type, description, status, amount, created_at')
    .eq('customer_id', id) // kun ordrer for valgt kunde
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend kjører på http://localhost:${PORT}`);
});
