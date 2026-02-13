// API: https://open.er-api.com (No key needed)

const amountEl = document.getElementById("amount");

const fromEl = document.getElementById("from");
const toEl = document.getElementById("to");

const fromSearch = document.getElementById("fromSearch");
const toSearch = document.getElementById("toSearch");

const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");

const convertBtn = document.getElementById("convertBtn");
const copyBtn = document.getElementById("copyBtn");
const swapBtn = document.getElementById("swapBtn");

const resultBig = document.getElementById("resultBig");
const resultSmall = document.getElementById("resultSmall");

const statusEl = document.getElementById("status");
const timeEl = document.getElementById("time");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

const themeBtn = document.getElementById("themeBtn");

const API = "https://open.er-api.com/v6/latest";

// Currency names (major ones)
const currencyNames = {
  USD: "United States Dollar",
  INR: "Indian Rupee",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  NZD: "New Zealand Dollar",
  SGD: "Singapore Dollar",
  ZAR: "South African Rand",
  THB: "Thai Baht",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso",
  PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka",
  LKR: "Sri Lankan Rupee",
  NPR: "Nepalese Rupee",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  KWD: "Kuwaiti Dinar",
  BHD: "Bahraini Dinar",
  OMR: "Omani Rial",
  TRY: "Turkish Lira",
  RUB: "Russian Ruble",
  UAH: "Ukrainian Hryvnia",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  CZK: "Czech Koruna",
  HUF: "Hungarian Forint",
  ILS: "Israeli Shekel",
  EGP: "Egyptian Pound",
  NGN: "Nigerian Naira",
  KES: "Kenyan Shilling",
  GHS: "Ghanaian Cedi",
  MAD: "Moroccan Dirham",
  TND: "Tunisian Dinar",
  DZD: "Algerian Dinar",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
  ARS: "Argentine Peso",
  CLP: "Chilean Peso",
  COP: "Colombian Peso",
  PEN: "Peruvian Sol",
  VND: "Vietnamese Dong",
  HKD: "Hong Kong Dollar",
TWD: "Taiwan Dollar"
};

let allCurrencies = []; // codes from API
let cachedRates = {};   // { base: { rates } }

function setStatus(text) {
  statusEl.textContent = text;
  timeEl.textContent = new Date().toLocaleString();
}

function getCurrencyLabel(code) {
  const name = currencyNames[code] ? ` — ${currencyNames[code]}` : "";
  return `${code}${name}`;
}

// Basic currency -> country mapping for flags
// (Not perfect, but looks great for most)
const currencyToCountry = {
  USD: "us",
  INR: "in",
  EUR: "eu",
  GBP: "gb",
  AED: "ae",
  AUD: "au",
  CAD: "ca",
  CHF: "ch",
  CNY: "cn",
  JPY: "jp",
  KRW: "kr",
  NZD: "nz",
  SGD: "sg",
  ZAR: "za",
  THB: "th",
  IDR: "id",
  MYR: "my",
  PHP: "ph",
  PKR: "pk",
  BDT: "bd",
  LKR: "lk",
  NPR: "np",
  SAR: "sa",
  QAR: "qa",
  KWD: "kw",
  BHD: "bh",
  OMR: "om",
  TRY: "tr",
  RUB: "ru",
  UAH: "ua",
  SEK: "se",
  NOK: "no",
  DKK: "dk",
  PLN: "pl",
  CZK: "cz",
  HUF: "hu",
  ILS: "il",
  EGP: "eg",
  NGN: "ng",
  KES: "ke",
  GHS: "gh",
  MAD: "ma",
  TND: "tn",
  DZD: "dz",
  MXN: "mx",
  BRL: "br",
  ARS: "ar",
  CLP: "cl",
  COP: "co",
  PEN: "pe",
  VND: "vn",
  HKD: "hk",
  TWD: "tw"
};

function setFlag(imgEl, currency) {
  const cc = currencyToCountry[currency] || "un"; // un = fallback
  // flagcdn
  imgEl.src = `https://flagcdn.com/w40/${cc}.png`;
}

function saveHistory(items) {
  localStorage.setItem("currency_history", JSON.stringify(items));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("currency_history")) || [];
  } catch {
    return [];
  }
}

function renderHistory() {
  const items = loadHistory();

  if (!items.length) {
    historyList.innerHTML = `<div class="historyEmpty">No conversions yet.</div>`;
    return;
  }

  historyList.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "historyItem";

    div.innerHTML = `
      <div class="historyLeft">
        <div class="main">${item.result}</div>
        <div class="sub">${item.details}</div>
      </div>
      <div class="historyRight">
        <span class="pill">${item.time}</span>
      </div>
    `;

    historyList.appendChild(div);
  });
}

function addToHistory(result, details) {
  const items = loadHistory();

  const newItem = {
    result,
    details,
    time: new Date().toLocaleTimeString()
  };

  items.unshift(newItem);

  // keep last 10
  const final = items.slice(0, 10);
  saveHistory(final);
  renderHistory();
}

function filterDropdown(selectEl, query) {
  const q = query.trim().toLowerCase();

  // rebuild options
  selectEl.innerHTML = "";

  const filtered = allCurrencies.filter((code) => {
    const label = getCurrencyLabel(code).toLowerCase();
    return label.includes(q);
  });

  for (const code of filtered) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = getCurrencyLabel(code);
    selectEl.appendChild(opt);
  }
}

async function fetchRates(base) {
  // cache
  if (cachedRates[base]) return cachedRates[base];

  const res = await fetch(`${API}/${base}`);
  const data = await res.json();

  cachedRates[base] = data.rates;
  return data.rates;
}

async function convert() {
  const amount = parseFloat(amountEl.value);

  if (isNaN(amount) || amount <= 0) {
    resultBig.textContent = "Invalid amount";
    resultSmall.textContent = "Please enter a valid number.";
    return;
  }

  const from = fromEl.value;
  const to = toEl.value;

  setStatus("Converting...");
  resultSmall.textContent = "Fetching live rates...";

  try {
    const rates = await fetchRates(from);
    const rate = rates[to];

    if (!rate) {
      resultBig.textContent = "Rate not found";
      resultSmall.textContent = "This currency pair is not available.";
      return;
    }

    const final = amount * rate;

    resultBig.textContent = `${final.toFixed(2)} ${to}`;
    resultSmall.textContent = `${amount} ${from} = ${rate.toFixed(6)} ${to}`;

    setFlag(fromFlag, from);
    setFlag(toFlag, to);

    addToHistory(
      `${final.toFixed(2)} ${to}`,
      `${amount} ${from} → ${to} (rate: ${rate.toFixed(6)})`
    );

    setStatus("Done");
  } catch (err) {
    setStatus("Error");
    resultBig.textContent = "Network Error";
    resultSmall.textContent = "Please try again later.";
    console.log(err);
  }
}

function swapCurrencies() {
  const temp = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = temp;

  setFlag(fromFlag, fromEl.value);
  setFlag(toFlag, toEl.value);

  convert();
}

function toggleTheme() {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
}

async function init() {
  setStatus("Loading currencies...");
  renderHistory();

  try {
    const res = await fetch(`${API}/USD`);
    const data = await res.json();

    allCurrencies = Object.keys(data.rates).sort();

    // Fill dropdowns
    fromEl.innerHTML = "";
    toEl.innerHTML = "";

    for (const code of allCurrencies) {
      const opt1 = document.createElement("option");
      opt1.value = code;
      opt1.textContent = getCurrencyLabel(code);

      const opt2 = document.createElement("option");
      opt2.value = code;
      opt2.textContent = getCurrencyLabel(code);

      fromEl.appendChild(opt1);
      toEl.appendChild(opt2);
    }

    // defaults
    fromEl.value = "USD";
    toEl.value = "INR";

    setFlag(fromFlag, fromEl.value);
    setFlag(toFlag, toEl.value);

    setStatus("Ready");
    convert();
  } catch (err) {
    setStatus("Error");
    resultBig.textContent = "API Error";
    resultSmall.textContent = "Could not load currency list.";
    console.log(err);
  }
}

// Events
convertBtn.addEventListener("click", convert);
swapBtn.addEventListener("click", swapCurrencies);
themeBtn.addEventListener("click", toggleTheme);

fromEl.addEventListener("change", () => {
  setFlag(fromFlag, fromEl.value);
  convert();
});

toEl.addEventListener("change", () => {
  setFlag(toFlag, toEl.value);
  convert();
});

amountEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") convert();
});

// Search filters
fromSearch.addEventListener("input", () => {
  const current = fromEl.value;
  filterDropdown(fromEl, fromSearch.value);
  // try keep selection
  if (allCurrencies.includes(current)) fromEl.value = current;
});

toSearch.addEventListener("input", () => {
  const current = toEl.value;
  filterDropdown(toEl, toSearch.value);
  if (allCurrencies.includes(current)) toEl.value = current;
});

// Clear history
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("currency_history");
  renderHistory();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultBig.textContent);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 900);
  } catch {
    copyBtn.textContent = "Failed";
    setTimeout(() => (copyBtn.textContent = "Copy"), 900);
  }
});

// Init
init();
