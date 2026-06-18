// ------------------------------------------------------------
//  Dashboard – henter kunder og ordrer fra backend
// ------------------------------------------------------------

// Hent tokenet vi fikk ved innlogging.
const token = sessionStorage.getItem('token');

// FRONTEND-VAKT: ingen token -> tilbake til innlogging.
// (Backend sjekker tokenet på nytt ved hvert kall.)
if (!token) {
  window.location.href = 'login.html';
}

// Hjelpefunksjon: kall backend med token i Authorization-headeren.
async function api(path) {
  const res = await fetch(API_URL + path, {
    headers: { Authorization: 'Bearer ' + token },
  });

  // Token utløpt / ugyldig -> logg ut og send til innlogging
  if (res.status === 401) {
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }
  if (!res.ok) throw new Error('Feil ved henting av data');
  return res.json();
}

// 1) Hent og vis alle kunder
async function loadCustomers() {
  const list = document.getElementById('customer-list');
  list.innerHTML = '<li>Laster …</li>';

  try {
    const customers = await api('/api/customers');
    list.innerHTML = '';

    customers.forEach((customer) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.textContent = customer.name; // textContent = trygt mot XSS
      // Ved KLIKK på en kunde -> hent ordrene hennes
      li.addEventListener('click', () => loadOrders(customer));
      list.appendChild(li);
    });
  } catch (e) {
    list.innerHTML = '<li class="error">Kunne ikke laste kunder.</li>';
  }
}

// 2) Hent og vis ordrer for valgt kunde
async function loadOrders(customer) {
  const title = document.getElementById('orders-title');
  const hint = document.getElementById('orders-hint');
  const table = document.getElementById('orders-table');
  const tbody = table.querySelector('tbody');

  title.textContent = 'Ordrer – ' + customer.name;
  hint.textContent = 'Laster …';
  table.hidden = true;
  tbody.innerHTML = '';

  try {
    const orders = await api(`/api/customers/${customer.id}/orders`);

    if (!orders || orders.length === 0) {
      hint.textContent = 'Ingen ordrer registrert på denne kunden.';
      return;
    }

    orders.forEach((o) => {
      const tr = document.createElement('tr');
      const cells = [
        o.appliance_type ?? '',
        o.description ?? '',
        o.status ?? '',
        (o.amount ?? '') + ' kr',
        new Date(o.created_at).toLocaleDateString('no-NO'),
      ];
      cells.forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value; // textContent = trygt mot XSS
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    hint.textContent = '';
    table.hidden = false;
  } catch (e) {
    hint.textContent = 'Kunne ikke laste ordrer.';
  }
}

// 3) Logg ut: fjern token og gå til innlogging
document.getElementById('logout').addEventListener('click', () => {
  sessionStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Start
loadCustomers();
