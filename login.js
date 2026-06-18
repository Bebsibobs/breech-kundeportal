// ------------------------------------------------------------
//  Innlogging mot Supabase Auth
// ------------------------------------------------------------

// Lag en Supabase-klient med den offentlige anon-nøkkelen.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Er brukeren allerede innlogget? Send rett til dashboard.
sb.auth.getSession().then(({ data }) => {
  if (data.session) window.location.href = "dashboard.html";
});

const form = document.getElementById("login-form");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stopp vanlig skjema-innsending
  errorEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Frontend-validering (rask tilbakemelding til brukeren)
  if (!email || !password) {
    errorEl.textContent = "Fyll inn både e-post og passord.";
    return;
  }

  // Passordet sendes kryptert (HTTPS/TLS) direkte til Supabase.
  // Vi får tilbake en session med et JWT-token hvis det stemmer.
  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = "Feil e-post eller passord.";
    return;
  }

  // Token lagres automatisk av Supabase-klienten -> videre til dashboard.
  window.location.href = "dashboard.html";
});
