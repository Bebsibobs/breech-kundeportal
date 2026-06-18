// Offentlig konfigurasjon for frontend.
// MERK: anon-nøkkelen er laget for å være offentlig (den er trygg i
// nettleseren fordi RLS i databasen bestemmer hva den får lov til).
// Service-role-nøkkelen skal ALDRI ligge her – kun i backend.

const SUPABASE_URL = "https://iqcbpwebzvbovfszundv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY2Jwd2VienZib3Zmc3p1bmR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5NDExOSwiZXhwIjoyMDk3MjcwMTE5fQ.Uj8LU6RwB6TE1m2HDMrS5F-xES9YUdtKA9nWy0VQjUE";

// Adressen til vår egen Express-backend
const API_URL = "http://localhost:3000";
