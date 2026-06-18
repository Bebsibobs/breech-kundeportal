// ============================================================
//  Breech AS – Backend (Node + Express)
//  Oppgave: beskytte API-et og hente data fra Supabase.
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// CORS: tillat at frontend (annen port) kan kalle API-et.
app.use(cors());
// Tolker JSON-body på innkommende forespørsler.
app.use(express.json());

// Supabase-klient med SERVICE ROLE-nøkkel.
// Denne nøkkelen er hemmelig og må ALDRI ligge i frontend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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