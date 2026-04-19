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
  balances.replaceChildren();
  itemsList.replaceChildren();
  saleCustomer.replaceChildren();
  saleItem.replaceChildren();

  if (!app.customers.length) {
    const li = document.createElement("li");
    li.textContent = "No customers yet.";
    balances.appendChild(li);
  } else {
    for (const customer of app.customers) {
      const li = document.createElement("li");
      li.textContent = `${customer.name} (${customer.phone}) - NPR ${(balanceMap.get(customer.id) || 0).toFixed(2)}`;
      balances.appendChild(li);
    }
  }

  if (!app.items.length) {
    const li = document.createElement("li");
    li.textContent = "No items yet.";
    itemsList.appendChild(li);
  } else {
    for (const item of app.items) {
      const li = document.createElement("li");
      li.textContent = `${item.name} (${item.type}) - NPR ${item.price.toFixed(2)}`;
      itemsList.appendChild(li);
    }
  }

  const defaultCustomer = document.createElement("option");
  defaultCustomer.value = "";
  defaultCustomer.textContent = "Select customer";
  saleCustomer.appendChild(defaultCustomer);
  for (const customer of app.customers) {
    const option = document.createElement("option");
    option.value = customer.id;
    option.textContent = customer.name;
    saleCustomer.appendChild(option);
  }

  const defaultItem = document.createElement("option");
  defaultItem.value = "";
  defaultItem.textContent = "Select item";
  saleItem.appendChild(defaultItem);
  for (const item of app.items) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.type})`;
    saleItem.appendChild(option);
  }

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
