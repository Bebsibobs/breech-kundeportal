// ------------------------------------------------------------
//  Innlogging – sender e-post/passord til VÅR backend
// ------------------------------------------------------------

// Er man allerede innlogget (har et token)? Send til dashboard.
if (sessionStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stopp vanlig skjema-innsending
  errorEl.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Frontend-validering (rask tilbakemelding)
  if (!email || !password) {
    errorEl.textContent = 'Fyll inn både e-post og passord.';
    return;
  }

  try {
    // Sender innloggingen til backend over HTTPS.
    const res = await fetch(API_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Innlogging feilet.';
      return;
    }

    // Backend ga oss et token -> lagre det og gå til dashboard.
    sessionStorage.setItem('token', data.access_token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    errorEl.textContent = 'Får ikke kontakt med serveren.';
  }
});
