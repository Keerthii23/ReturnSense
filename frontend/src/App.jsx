import { useEffect, useMemo, useState } from "react";
import "./index.css";
const API_URL = "http://localhost:8081/api";
const AI_API_URL = "http://localhost:8000";

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
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState("");
  const [orders, setOrders] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [predictionCategory, setPredictionCategory] = useState("Mobiles");
  const [predictionPrice, setPredictionPrice] = useState("25000");
  const [predictionDays, setPredictionDays] = useState("7");
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    async function loadBackendData() {
      setBackendLoading(true);
      setBackendError("");

      try {
        const [ordersResponse, analyticsResponse] = await Promise.all([
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/analytics`),
        ]);

        if (!ordersResponse.ok || !analyticsResponse.ok) {
          throw new Error("The backend did not return the required data.");
        }

        const backendOrders = await ordersResponse.json();
        const backendAnalytics = await analyticsResponse.json();

        setOrders(
          backendOrders.map((order) => ({
            orderId: order.orderId,
            category: order.category,
            returned: order.returnStatus?.toLowerCase() === "returned",
          }))
        );

        setAnalytics(backendAnalytics);
      } catch (error) {
        setBackendError(
          "Could not load saved backend data. Make sure Spring Boot is running on port 8081 and CORS allows this frontend."
        );
        console.error("Backend loading error:", error);
      } finally {
        setBackendLoading(false);
      }
    }

    loadBackendData();
  }, []);

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

  const returnedOrders =
  analytics?.returnedOrders ??
  orders.filter((order) => order.returned).length;

const returnRate =
  analytics?.returnRate ??
  (orders.length === 0
    ? 0
    : (returnedOrders / orders.length) * 100);

const totalOrders = analytics?.totalOrders ?? orders.length;

const categoryAnalytics = useMemo(() => {
  if (analytics?.categoryAnalytics) {
    return Object.entries(analytics.categoryAnalytics).map(
      ([category, stats]) => ({
        category,
        totalOrders: stats.totalOrders,
        returnedOrders: stats.returnedOrders,
        returnRate: stats.returnRate,
      })
    );
  }

  const grouped = {};

  orders.forEach((order) => {
    if (!grouped[order.category]) {
      grouped[order.category] = {
        category: order.category,
        totalOrders: 0,
        returnedOrders: 0,
      };
    }

    grouped[order.category].totalOrders++;

    if (order.returned) {
      grouped[order.category].returnedOrders++;
    }
  });

  return Object.values(grouped)
    .map((item) => ({
      ...item,
      returnRate:
        item.totalOrders === 0
          ? 0
          : (item.returnedOrders / item.totalOrders) * 100,
    }))
    .sort((a, b) => b.returnRate - a.returnRate);
}, [orders, analytics]);

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

      const payload = importedOrders.map((order) => ({
        orderId: order.orderId,
        category: order.category,
        returnStatus: order.returned ? "returned" : "not_returned",
      }));

      const importResponse = await fetch(`${API_URL}/orders/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        throw new Error(errorText || `CSV import failed (${importResponse.status}).`);
      }

      const importResult = await importResponse.json();

      const [ordersResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/analytics`),
      ]);

      if (!ordersResponse.ok || !analyticsResponse.ok) {
        throw new Error(
          "The CSV was saved, but the dashboard could not refresh. Reload the page to see the saved data."
        );
      }

      const backendOrders = await ordersResponse.json();
      const backendAnalytics = await analyticsResponse.json();

      setOrders(
        backendOrders.map((order) => ({
          orderId: order.orderId,
          category: order.category,
          returned: order.returnStatus?.toLowerCase() === "returned",
        }))
      );
      setAnalytics(backendAnalytics);
      setBackendError("");
      setFileName(file.name);
      setNotice(
        `CSV import complete: ${importResult.saved} new orders saved; ${importResult.skippedExisting} existing orders skipped.`
      );
    } catch (error) {
      setUploadError(
        error.message || "Unable to import the CSV file. Check that the backend is running."
      );
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
    // This clears only the local upload confirmation; it does not delete database records.
    setFileName("");
    setUploadError("");
  }

  async function predictReturnRisk(event) {
    event.preventDefault();
    setPredictionError("");
    setPrediction(null);
    setIsPredicting(true);

    try {
      const response = await fetch(`${AI_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: predictionCategory,
          price: Number(predictionPrice),
          daysSincePurchase: Number(predictionDays),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Prediction service returned ${response.status}.`);
      }

      setPrediction(await response.json());
    } catch (error) {
      setPredictionError(
        error.message?.includes("Failed to fetch")
          ? "AI service is not running yet. Start the Python prediction service on port 8000, then try again."
          : error.message || "Could not generate a prediction."
      );
    } finally {
      setIsPredicting(false);
    }
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
                View orders saved in MySQL, import historical CSV records, and
                monitor category-level return patterns. Dashboard statistics
                refresh from the backend after each successful import.
              </p>
            </div>
          </div>

          {backendLoading && (
            <p className="data-empty" role="status">
              Loading saved orders and analytics from the backend...
            </p>
          )}

          {backendError && (
            <p className="upload-error" role="alert">
              {backendError}
            </p>
          )}

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
                {isReading ? "Uploading CSV..." : "Upload order CSV"}
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
                Processed <strong>{fileName}</strong> —{" "}
                {orders.length} order records currently saved in the database.
              </span>
              <button type="button" onClick={clearAnalytics}>
                Dismiss message
              </button>
            </div>
          )}

          <div className="analytics-metrics">
            <article className="metric-card">
              <small>Total saved orders</small>
              <strong>{orders.length.toLocaleString("en-IN")}</strong>
              <span>Orders currently stored in MySQL</span>
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

        <section className="section-container return-management" id="insights">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AI INSIGHTS</span>
              <h2>Predict return risk.</h2>
              <p>
                Enter order details to request a prediction from the Python AI
                service. This is a demo workflow; prediction quality depends on
                the model and the amount of representative training data.
              </p>
            </div>
          </div>

          <form className="upload-panel" onSubmit={predictReturnRisk}>
            <div className="upload-copy">
              <h3>Order details</h3>
              <p>Choose a product category and enter its price and days since purchase.</p>
              <label className="prediction-field">
                Product category
                <select value={predictionCategory} onChange={(event) => setPredictionCategory(event.target.value)}>
                  <option>Mobiles</option>
                  <option>Laptops</option>
                  <option>Audio</option>
                  <option>Wearables</option>
                </select>
              </label>
              <label className="prediction-field">
                Order price (₹)
                <input type="number" min="1" step="1" required value={predictionPrice} onChange={(event) => setPredictionPrice(event.target.value)} />
              </label>
              <label className="prediction-field">
                Days since purchase
                <input type="number" min="0" max="3650" step="1" required value={predictionDays} onChange={(event) => setPredictionDays(event.target.value)} />
              </label>
            </div>
            <div className="upload-actions">
              <button className="primary-button" type="submit" disabled={isPredicting}>
                {isPredicting ? "Predicting..." : "Predict return risk"}
              </button>
            </div>
          </form>

          {predictionError && <p className="upload-error" role="alert">{predictionError}</p>}
          {prediction && (
            <div className="file-success" role="status">
              <span>✦</span>
              <span>
                <strong>Prediction: {prediction.riskLevel || prediction.prediction || "Result received"}</strong>
                {prediction.probability != null && ` — estimated risk ${(Number(prediction.probability) * (Number(prediction.probability) <= 1 ? 100 : 1)).toFixed(1)}%`}
                {prediction.note && <span> {prediction.note}</span>}
              </span>
            </div>
          )}
          <p className="chart-empty">
            Demo only: do not use this result to make customer decisions until a model has been trained and evaluated on representative historical data.
          </p>
        </section>
    </main>
  </div>
);
}

export default App;
