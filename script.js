// ----- STATE -----
let transactions = [];
// Fetch all transactions from backend
async function fetchTransactions() {
  const res = await fetch("http://localhost:5000/api/transactions");
  transactions = await res.json();
  render();
}

// ----- SELECTORS -----
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");

const form = document.getElementById("transaction-form");
const descInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const filterType = document.getElementById("filter-type");
const clearAllBtn = document.getElementById("clear-all");

const tableBody = document.getElementById("transactions-body");
const emptyState = document.getElementById("empty-state");

// Set today's date by default
function setToday() {
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;
}

// ----- HELPERS -----
function formatMoney(n) {
  return "₹" + Number(n).toFixed(2);
}

async function addTransaction(t) {
  await fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(t),
  });

  fetchTransactions(); // reload data
}

async function deleteTransaction(id) {
  await fetch(`http://localhost:5000/api/transactions/${id}`, {
    method: "DELETE",
  });

  fetchTransactions();
}

function clearAll() {
  if (confirm("Delete all transactions?")) {
    transactions = [];
    render();
  }
}

// ----- RENDER FUNCTIONS -----
function updateSummary() {
  let income = 0,
    expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  balanceEl.textContent = formatMoney(income - expense);
  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(expense);
}

function render() {
  const filter = filterType.value;
  tableBody.innerHTML = "";

  let filtered = transactions;

  if (filter !== "all") {
    filtered = transactions.filter((t) => t.type === filter);
  }

  // Empty state
  emptyState.style.display = filtered.length === 0 ? "block" : "none";

  filtered.forEach((t) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${t.description}</td>
      <td>${t.category || "-"}</td>
      <td><span class="${t.type === "income" ? "tag-income" : "tag-expense"}">${
        t.type
      }</span></td>
      <td class="${
        t.type === "income" ? "amount-pos" : "amount-neg"
      }">${formatMoney(t.amount)}</td>
      <td>${t.date}</td>
      <td><button class="btn-outline" onclick=deleteTransaction('${t._id}')
      }')">❌</button></td>
    `;

    tableBody.appendChild(row);
  });

  updateSummary();
}

// ----- FORM SUBMIT -----
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = descInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value.trim();
  const date = dateInput.value;

  if (!description || !amount || amount <= 0) {
    alert("Enter valid description and amount.");
    return;
  }

  const transaction = {
    id: Date.now().toString(),
    description,
    amount,
    type,
    category,
    date,
  };

  addTransaction(transaction);

  form.reset();
  setToday();
});

// ----- EVENT LISTENERS -----
filterType.addEventListener("change", render);
clearAllBtn.addEventListener("click", clearAll);

// ----- START APP -----
setToday();
fetchTransactions();
