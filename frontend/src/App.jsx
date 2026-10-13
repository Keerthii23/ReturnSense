import { useMemo, useState } from "react";
import "./index.css";

const products = [
  {
    id: 1,
    name: "iPhone 16",
    category: "Mobiles",
    brand: "Apple",
    price: 69999,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=700&q=85",
    description: "Advanced camera and powerful performance",
  },
  {
    id: 2,
    name: "Galaxy S25",
    category: "Mobiles",
    brand: "Samsung",
    price: 74999,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85",
    description: "Brilliant display and smooth performance",
  },
  {
    id: 3,
    name: "MacBook Air",
    category: "Laptops",
    brand: "Apple",
    price: 99900,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85",
    description: "Lightweight laptop for work and study",
  },
  {
    id: 4,
    name: "Wireless Headphones",
    category: "Audio",
    brand: "Sony",
    price: 8990,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",
    description: "Immersive sound for everyday listening",
  },
  {
    id: 5,
    name: "Smart Watch",
    category: "Wearables",
    brand: "Samsung",
    price: 12999,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",
    description: "Stay connected throughout your day",
  },
  {
    id: 6,
    name: "Gaming Laptop",
    category: "Laptops",
    brand: "ASUS",
    price: 84990,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=85",
    description: "Powerful performance for gaming and creation",
  },
  {
    id: 7,
    name: "Bluetooth Speaker",
    category: "Audio",
    brand: "JBL",
    price: 4999,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85",
    description: "Portable audio for music anywhere",
  },
  {
    id: 8,
    name: "Wireless Earbuds",
    category: "Audio",
    brand: "Sony",
    price: 6990,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=85",
    description: "Compact earbuds for everyday use",
  },
];

const categories = [
  { name: "All Products", icon: "▦" },
  { name: "Mobiles", icon: "▯" },
  { name: "Laptops", icon: "▱" },
  { name: "Audio", icon: "♫" },
  { name: "Wearables", icon: "◷" },
];

const sampleCsv = [
  "order_id,category,return_status",
  "ORD001,Mobiles,returned",
  "ORD002,Laptops,not_returned",
  "ORD003,Audio,returned",
  "ORD004,Mobiles,not_returned",
  "ORD005,Laptops,not_returned",
].join("\n");

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// Handles ordinary CSV fields, quoted fields, commas inside quotes,
// and escaped double quotes.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;

      row.push(field.trim());

      if (row.some((value) => value !== "")) rows.push(row);

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) {
    throw new Error("The CSV contains an unclosed quoted field.");
  }

  row.push(field.trim());

  if (row.some((value) => value !== "")) rows.push(row);

  return rows;
}

function parseOrders(text) {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error(
      "The CSV must contain a header and at least one order."
    );
  }

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header)
      .trim()
      .toLowerCase()
  );

  const orderIndex = headers.indexOf("order_id");
  const categoryIndex = headers.indexOf("category");
  const statusIndex = headers.indexOf("return_status");

  if ([orderIndex, categoryIndex, statusIndex].includes(-1)) {
    throw new Error(
      "Missing columns. Required headers: order_id, category, return_status."
    );
  }

  const seenIds = new Set();

  return rows.slice(1).map((values, index) => {
    const rowNumber = index + 2;
    const orderId = values[orderIndex]?.trim();
    const category = values[categoryIndex]?.trim();
    const status = values[statusIndex]?.trim().toLowerCase();

    if (!orderId || !category || !status) {
      throw new Error(`Please check the missing data on row ${rowNumber}.`);
    }

    if (seenIds.has(orderId)) {
      throw new Error(`Duplicate order ID "${orderId}" on row ${rowNumber}.`);
    }

    if (!["returned", "not_returned"].includes(status)) {
      throw new Error(
        `Invalid return_status on row ${rowNumber}. Use returned or not_returned.`
      );
    }

    seenIds.add(orderId);

    return {
      orderId,
      category,
      returned: status === "returned",
    };
  });
}

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState("");
  const [orders, setOrders] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isReading, setIsReading] = useState(false);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All Products" || product.category === category;

      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const returnedOrders = orders.filter((order) => order.returned).length;

  const returnRate =
    orders.length === 0 ? 0 : (returnedOrders / orders.length) * 100;

  const categoryAnalytics = useMemo(() => {
    const grouped = {};

    orders.forEach((order) => {
      if (!grouped[order.category]) {
        grouped[order.category] = {
          category: order.category,
          total: 0,
          returned: 0,
        };
      }

      grouped[order.category].total += 1;

      if (order.returned) grouped[order.category].returned += 1;
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        returnRate: (item.returned / item.total) * 100,
      }))
      .sort((a, b) => b.returnRate - a.returnRate);
  }, [orders]);

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setNotice(`${product.name} added to cart.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function showCart() {
    if (cart.length === 0) {
      setNotice("Your demo cart is empty.");
    } else {
      setNotice(
        `Demo cart: ${cartCount} item(s), totaling ${money(cartTotal)}.`
      );
    }

    window.setTimeout(() => setNotice(""), 3000);
  }

  async function handleCsvUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError("");
    setIsReading(true);

    try {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Please select a .csv file.");
      }

      const text = await file.text();
      const importedOrders = parseOrders(text);

      setOrders(importedOrders);
      setFileName(file.name);
    } catch (error) {
      setUploadError(error.message || "Unable to read the CSV file.");
    } finally {
      setIsReading(false);
      event.target.value = "";
    }
  }

  function downloadSampleCsv() {
    const blob = new Blob([sampleCsv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "returnsense-sample-orders.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function clearAnalytics() {
    setOrders([]);
    setFileName("");
    setUploadError("");
  }

  return (
    <div className="app">
      <div className="announcement">
        <span>✦</span> ReturnSense — smarter electronics return management
      </div>

      <header className="navbar">
        <a className="brand" href="#home" aria-label="ReturnSense home">
          <span className="brand-icon">R</span>
          <span>
            Return<span className="brand-accent">Sense</span>
            <small>SMARTER ELECTRONICS</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Electronics</a>
          <a href="#return-management">Return management</a>
          <a href="#insights">AI insights</a>
        </nav>

        <div className="nav-actions">
          <button
            className="cart-button"
            type="button"
            onClick={showCart}
            aria-label={`Demo cart with ${cartCount} items`}
          >
            <span aria-hidden="true">🛒</span> Demo cart
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>

      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="live-dot" /> ELECTRONICS OPERATIONS PLATFORM
            </span>

            <h1>
              Understand returns.
              <br />
              <span>Make smarter decisions.</span>
            </h1>

            <p>
              Import historical electronics order data, monitor return
              patterns, and prepare for AI-powered return-risk analysis.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#return-management">
                Analyze return data <span>→</span>
              </a>
              <a className="secondary-button" href="#insights">
                Explore AI insights
              </a>
            </div>

            <div className="hero-trust">
              <span>✓ CSV-based analysis</span>
              <span>✓ Electronics-focused</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="hero-product hero-phone">
              <img src={products[0].image} alt="Smartphone" />
            </div>

            <div className="hero-product hero-laptop">
              <img src={products[2].image} alt="Laptop" />
            </div>

            <div className="floating-label">
              <span className="floating-icon">✦</span>
              <div>
                <strong>Return intelligence</strong>
                <small>Insights from recorded data</small>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" aria-label="Platform capabilities">
          <div>
            <span className="benefit-icon">◇</span>
            <div>
              <strong>Data import</strong>
              <small>Upload historical order records</small>
            </div>
          </div>
          <div>
            <span className="benefit-icon">⌕</span>
            <div>
              <strong>Return analytics</strong>
              <small>Measure recorded outcomes</small>
            </div>
          </div>
          <div>
            <span className="benefit-icon">◈</span>
            <div>
              <strong>AI-ready workflow</strong>
              <small>Prepare for risk prediction</small>
            </div>
          </div>
        </section>

        <section className="catalog section-container" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ELECTRONICS CATALOG</span>
              <h2>Supported product categories.</h2>
              <p>
                Sample electronics for demonstrating category-based
                return analysis.
              </p>
            </div>
            <span className="result-count">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="catalog-toolbar">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, brands..."
                aria-label="Search products"
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="category-list" aria-label="Product categories">
              {categories.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`category-button ${
                    category === item.name ? "active" : ""
                  }`}
                  onClick={() => setCategory(item.name)}
                  aria-pressed={category === item.name}
                >
                  <span>{item.icon}</span> {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                  <span className="product-category">{product.category}</span>
                </div>

                <div className="product-details">
                  <div className="product-brand">{product.brand}</div>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-rating">
                    <span>★</span> {product.rating.toFixed(1)}
                    <span className="rating-note">Demo rating</span>
                  </div>

                  <div className="product-bottom">
                    <div className="product-price">{money(product.price)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No products found</h3>
              <p>Try another search term or select a different category.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All Products");
                }}
              >
                Show all products
              </button>
            </div>
          )}
        </section>

        <section
          className="section-container return-management"
          id="return-management"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">RETURN MANAGEMENT</span>
              <h2>Understand your returns.</h2>
              <p>
                Upload historical order records to calculate return
                statistics. Data is processed in this browser and is not
                saved to a database yet.
              </p>
            </div>
          </div>

          <div className="upload-panel">
            <div className="upload-copy">
              <h3>Import order history</h3>
              <p>
                Your CSV must contain <code>order_id</code>,{" "}
                <code>category</code>, and <code>return_status</code>.
                Status must be <code>returned</code> or{" "}
                <code>not_returned</code>.
              </p>
            </div>

            <div className="upload-actions">
              <label className="primary-button upload-button">
                {isReading ? "Reading file..." : "Upload order CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvUpload}
                  disabled={isReading}
                  hidden
                />
              </label>

              <button
                type="button"
                className="secondary-button"
                onClick={downloadSampleCsv}
              >
                Download sample CSV
              </button>
            </div>
          </div>

          {uploadError && (
            <p className="upload-error" role="alert">
              {uploadError}
            </p>
          )}

          {fileName && !uploadError && (
            <div className="file-success" role="status">
              <span>✓</span>
              <span>
                Successfully imported <strong>{fileName}</strong> —{" "}
                {orders.length} unique order records.
              </span>
              <button type="button" onClick={clearAnalytics}>
                Clear data
              </button>
            </div>
          )}

          <div className="analytics-metrics">
            <article className="metric-card">
              <small>Eligible records in file</small>
              <strong>{orders.length.toLocaleString("en-IN")}</strong>
              <span>Imported order records</span>
            </article>

            <article className="metric-card">
              <small>Recorded returns</small>
              <strong>{returnedOrders.toLocaleString("en-IN")}</strong>
              <span>Orders marked returned</span>
            </article>

            <article className="metric-card">
              <small>Observed return rate</small>
              <strong>{returnRate.toFixed(1)}%</strong>
              <span>Returned ÷ imported records</span>
            </article>
          </div>

          {orders.length === 0 && (
            <p className="data-empty">
              No order data imported yet. Download the sample CSV above to
              test this feature. The dashboard will update after upload.
            </p>
          )}

          {categoryAnalytics.length > 0 ? (
        <div className="category-rate-list">
          {categoryAnalytics.map((item) => (
            <div className="category-rate-item" key={item.category}>
              <div className="category-rate-label">
                <span>{item.category}</span>
                <strong>{item.returnRate.toFixed(1)}%</strong>
              </div>

              <div className="rate-track">
                <div
                  className="rate-fill"
                  style={{
                    width: `${Math.min(item.returnRate, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="chart-empty">
          Import your order CSV to see category-wise return rates.
        </p>
      )}
    </section>
    </main>
  </div>
);
}

export default App;