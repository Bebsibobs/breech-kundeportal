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
