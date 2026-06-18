// ------------------------------------------------------------
//  Dashboard – henter kunder og ordrer fra backend
// ------------------------------------------------------------

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let accessToken = null;

// 1) FRONTEND-VAKT: er brukeren innlogget?
//    Hvis ikke -> send til login. (Backend sjekker dette på nytt.)
async function init() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }
  accessToken = data.session.access_token; // JWT-token vi sender til backend
  loadCustomers();
}

// Hjelpefunksjon: kall backend med token i Authorization-headeren.
async function api(path) {
  const res = await fetch(API_URL + path, {
    headers: { Authorization: "Bearer " + accessToken },
  });

  // Token utløpt / ugyldig -> tilbake til innlogging
  if (res.status === 401) {
    window.location.href = "login.html";
    return;
  }
  if (!res.ok) throw new Error("Feil ved henting av data");
  return res.json();
}

// 2) Hent og vis alle kunder
async function loadCustomers() {
  const list = document.getElementById("customer-list");
  list.innerHTML = "<li>Laster …</li>";

  try {
    const customers = await api("/api/customers");
    list.innerHTML = "";

    customers.forEach((customer) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = customer.name; // textContent = trygt mot XSS
      // Ved KLIKK på en kunde -> hent ordrene hennes
      li.addEventListener("click", () => loadOrders(customer));
      list.appendChild(li);
    });
  } catch (e) {
    list.innerHTML = '<li class="error">Kunne ikke laste kunder.</li>';
  }
}

// 3) Hent og vis ordrer for valgt kunde
async function loadOrders(customer) {
  const title = document.getElementById("orders-title");
  const hint = document.getElementById("orders-hint");
  const table = document.getElementById("orders-table");
  const tbody = table.querySelector("tbody");

  title.textContent = "Ordrer – " + customer.name;
  hint.textContent = "Laster …";
  table.hidden = true;
  tbody.innerHTML = "";

  try {
    const orders = await api(`/api/customers/${customer.id}/orders`);

    if (!orders || orders.length === 0) {
      hint.textContent = "Ingen ordrer registrert på denne kunden.";
      return;
    }

    orders.forEach((o) => {
      const tr = document.createElement("tr");
      // Bygger cellene med textContent for å unngå XSS
      const cells = [
        o.appliance_type ?? "",
        o.description ?? "",
        o.status ?? "",
        (o.amount ?? "") + " kr",
        new Date(o.created_at).toLocaleDateString("no-NO"),
      ];
      cells.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    hint.textContent = "";
    table.hidden = false;
  } catch (e) {
    hint.textContent = "Kunne ikke laste ordrer.";
  }
}

// 4) Logg ut
document.getElementById("logout").addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.href = "login.html";
});

init();
