const state = {
  customers: [],
  sales: [],
};
const STORAGE_KEY = 'posData';
const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'Admin#123',
};

const loginSection = document.getElementById('login-section');
const posSection = document.getElementById('pos-section');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout');
const customerForm = document.getElementById('customer-form');
const saleForm = document.getElementById('sale-form');
const customerSelect = document.getElementById('sale-customer');
const balancesList = document.getElementById('balances');
const itemTypeSelect = document.getElementById('item-type');
const bookOptions = document.getElementById('book-options');
const schoolInput = document.getElementById('school');
const gradeSelect = document.getElementById('grade');

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.customers)) {
      state.customers = parsed.customers;
    }
    if (Array.isArray(parsed.sales)) {
      state.sales = parsed.sales;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function renderCustomerOptions() {
  customerSelect.innerHTML = '<option value="">Choose customer</option>';
  state.customers.forEach((customer) => {
    const option = document.createElement('option');
    option.value = customer.id;
    option.textContent = `${customer.name} (${customer.phone})`;
    customerSelect.appendChild(option);
  });
}

function renderBalances() {
  balancesList.innerHTML = '';
  if (!state.customers.length) {
    balancesList.innerHTML = '<li>No customers added yet.</li>';
    return;
  }

  state.customers.forEach((customer) => {
    const due = state.sales
      .filter((sale) => sale.customerId === customer.id)
      .reduce((sum, sale) => sum + sale.total - sale.paid, 0);

    const row = document.createElement('li');
    row.textContent = `${customer.name}: NPR ${due.toFixed(2)}`;
    balancesList.appendChild(row);
  });
}

function showPos() {
  loginSection.classList.add('hidden');
  posSection.classList.remove('hidden');
}

function showLogin() {
  posSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
}

itemTypeSelect.addEventListener('change', () => {
  const isBook = itemTypeSelect.value === 'book';
  bookOptions.classList.toggle('hidden', !isBook);
  schoolInput.required = isBook;
  gradeSelect.required = isBook;
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    return;
  }

  if (username !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
    alert('Invalid credentials.');
    return;
  }

  sessionStorage.setItem('posSession', crypto.randomUUID());
  showPos();
  renderCustomerOptions();
  renderBalances();
  loginForm.reset();
});

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('posSession');
  showLogin();
});

customerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  state.customers.push({ id: crypto.randomUUID(), name, phone });
  saveState();

  customerForm.reset();
  renderCustomerOptions();
  renderBalances();
});

saleForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const customerId = customerSelect.value;
  const itemType = itemTypeSelect.value;
  const itemName = document.getElementById('item-name').value.trim();
  const quantity = Number(document.getElementById('quantity').value);
  const price = Number(document.getElementById('price').value);
  const paid = Number(document.getElementById('amount-paid').value);

  const sale = {
    customerId,
    itemType,
    itemName,
    quantity,
    price,
    paid,
    total: quantity * price,
  };

  if (itemType === 'book') {
    sale.school = schoolInput.value.trim();
    sale.grade = gradeSelect.value;
  }

  state.sales.push(sale);
  saveState();
  const currentItemType = itemTypeSelect.value;
  saleForm.reset();
  itemTypeSelect.value = currentItemType;
  itemTypeSelect.dispatchEvent(new Event('change'));
  renderBalances();
});

loadState();
renderCustomerOptions();

if (sessionStorage.getItem('posSession')) {
  showPos();
  renderBalances();
}

itemTypeSelect.dispatchEvent(new Event('change'));
