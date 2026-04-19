const storageKeys = {
  customers: "pos_customers",
  items: "pos_items",
  sales: "pos_sales",
  auth: "pos_auth",
};

const defaultAuth = {
  username: "admin",
  passwordHash: "a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea",
};

const app = {
  customers: load(storageKeys.customers, []),
  items: load(storageKeys.items, []),
  sales: load(storageKeys.sales, []),
};

function load(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem(storageKeys.customers, JSON.stringify(app.customers));
  localStorage.setItem(storageKeys.items, JSON.stringify(app.items));
  localStorage.setItem(storageKeys.sales, JSON.stringify(app.sales));
}

function toggleApp(isLoggedIn) {
  document.getElementById("login-section").classList.toggle("hidden", isLoggedIn);
  document.getElementById("app-section").classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) render();
}

async function hashText(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function getBalances() {
  const map = new Map(app.customers.map((customer) => [customer.id, 0]));
  for (const sale of app.sales) {
    map.set(sale.customerId, (map.get(sale.customerId) || 0) + sale.total);
  }
  return map;
}

function updateBookFields() {
  const itemId = document.getElementById("sale-item").value;
  const item = app.items.find((entry) => entry.id === itemId);
  const isBook = item?.type === "book";
  const bookMeta = document.getElementById("book-meta");
  const school = document.getElementById("sale-school");
  const grade = document.getElementById("sale-grade");

  bookMeta.classList.toggle("hidden", !isBook);
  school.required = isBook;
  grade.required = isBook;
  if (!isBook) {
    school.value = "";
    grade.value = "";
  }
}

function render() {
  const balances = document.getElementById("balances");
  const itemsList = document.getElementById("items");
  const saleCustomer = document.getElementById("sale-customer");
  const saleItem = document.getElementById("sale-item");
  const balanceMap = getBalances();

  balances.innerHTML = app.customers.length
    ? app.customers
        .map((customer) => `<li>${customer.name} (${customer.phone}) - NPR ${balanceMap.get(customer.id).toFixed(2)}</li>`)
        .join("")
    : "<li>No customers yet.</li>";

  itemsList.innerHTML = app.items.length
    ? app.items.map((item) => `<li>${item.name} (${item.type}) - NPR ${item.price.toFixed(2)}</li>`).join("")
    : "<li>No items yet.</li>";

  saleCustomer.innerHTML =
    '<option value="">Select customer</option>' +
    app.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("");

  saleItem.innerHTML =
    '<option value="">Select item</option>' +
    app.items.map((item) => `<option value="${item.id}">${item.name} (${item.type})</option>`).join("");

  updateBookFields();
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const loginMessage = document.getElementById("login-message");

  const hash = await hashText(password);
  if (username === defaultAuth.username && hash === defaultAuth.passwordHash) {
    localStorage.setItem(storageKeys.auth, "1");
    loginMessage.textContent = "";
    toggleApp(true);
    return;
  }

  loginMessage.textContent = "Invalid credentials.";
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem(storageKeys.auth);
  toggleApp(false);
});

document.getElementById("customer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  if (!name || !phone) return;

  app.customers.push({ id: uid("c"), name, phone });
  save();
  event.target.reset();
  render();
});

document.getElementById("item-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("item-name").value.trim();
  const type = document.getElementById("item-type").value;
  const price = Number(document.getElementById("item-price").value);
  if (!name || Number.isNaN(price) || price < 0) return;

  app.items.push({ id: uid("i"), name, type, price });
  save();
  event.target.reset();
  render();
});

document.getElementById("sale-item").addEventListener("change", updateBookFields);

document.getElementById("sale-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const customerId = document.getElementById("sale-customer").value;
  const itemId = document.getElementById("sale-item").value;
  const quantity = Number(document.getElementById("sale-qty").value);
  const school = document.getElementById("sale-school").value.trim();
  const grade = document.getElementById("sale-grade").value;

  const item = app.items.find((entry) => entry.id === itemId);
  if (!customerId || !item || Number.isNaN(quantity) || quantity < 1) return;
  if (item.type === "book" && (!school || !grade)) return;

  app.sales.push({
    id: uid("s"),
    customerId,
    itemId,
    quantity,
    total: item.price * quantity,
    school: item.type === "book" ? school : "",
    grade: item.type === "book" ? grade : "",
  });
  save();
  event.target.reset();
  document.getElementById("sale-qty").value = "1";
  render();
});

toggleApp(localStorage.getItem(storageKeys.auth) === "1");
