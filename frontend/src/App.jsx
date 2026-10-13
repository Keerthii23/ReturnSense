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

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState("");

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

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

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

    setNotice(`${product.name} added to cart`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function showCart() {
    if (cart.length === 0) {
      setNotice("Your cart is empty. Add a product to get started.");
    } else {
      setNotice(`Your cart has ${cartCount} item(s), totaling ${money(cartTotal)}.`);
    }

    window.setTimeout(() => setNotice(""), 3000);
  }

  return (
    <div className="app">
      <div className="announcement">
        <span>✦</span> Smart shopping starts here — explore your next upgrade
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
          <a href="#products">Shop electronics</a>
          <a href="#insights">AI insights</a>
        </nav>

        <div className="nav-actions">
          <button
            className="cart-button"
            type="button"
            onClick={showCart}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <span aria-hidden="true">🛒</span> Cart
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
              <span className="live-dot" /> YOUR ELECTRONICS DESTINATION
            </span>

            <h1>
              Upgrade your world.
              <br />
              <span>Shop smarter.</span>
            </h1>

            <p>
              Discover electronics you love, compare your options, and enjoy a
              smarter shopping experience powered by data.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#products">
                Explore products <span>→</span>
              </a>
              <a className="secondary-button" href="#insights">
                Discover ReturnSense
              </a>
            </div>

            <div className="hero-trust">
              <span>✓ Curated electronics</span>
              <span>✓ Clear product details</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="hero-product hero-phone">
              <img
                src={products[0].image}
                alt="Smartphone"
              />
            </div>

            <div className="hero-product hero-laptop">
              <img
                src={products[2].image}
                alt="Laptop"
              />
            </div>

            <div className="floating-label">
              <span className="floating-icon">✦</span>
              <div>
                <strong>Shop with confidence</strong>
                <small>Smarter product insights</small>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" aria-label="Shopping features">
          <div>
            <span className="benefit-icon">◇</span>
            <div>
              <strong>Curated collection</strong>
              <small>Explore popular electronics</small>
            </div>
          </div>
          <div>
            <span className="benefit-icon">⌕</span>
            <div>
              <strong>Easy discovery</strong>
              <small>Find products quickly</small>
            </div>
          </div>
          <div>
            <span className="benefit-icon">◈</span>
            <div>
              <strong>Data-driven insights</strong>
              <small>Understand return patterns</small>
            </div>
          </div>
        </section>

        <section className="catalog section-container" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>Find your next favourite.</h2>
              <p>Explore devices for work, entertainment, and everyday life.</p>
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
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <span className="product-category">{product.category}</span>
                  <button
                    type="button"
                    className="wishlist-button"
                    aria-label={`Add ${product.name} to wishlist`}
                    onClick={() =>
                      setNotice(`${product.name} wishlist is not enabled yet.`)
                    }
                  >
                    ♡
                  </button>
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
                    <button
                      className="add-button"
                      type="button"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      +
                    </button>
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

        <section className="insights-section" id="insights">
          <div className="insights-copy">
            <span className="eyebrow">THE SMARTER SIDE OF SHOPPING</span>
            <h2>
              Meet the intelligence
              <br />
              behind <span>ReturnSense.</span>
            </h2>
            <p>
              ReturnSense is designed to help electronics retailers understand
              return patterns and estimate which orders may be returned.
              Better insights can help businesses improve product information
              and customer experience.
            </p>
            <span className="coming-soon">
              <span className="live-dot" /> AI analytics — coming in the next
              milestone
            </span>
          </div>

          <div className="insight-preview">
            <div className="preview-top">
              <div>
                <span className="preview-kicker">RETURNS OVERVIEW</span>
                <h3>Analytics preview</h3>
              </div>
              <span className="preview-tag">DEMO</span>
            </div>

            <div className="preview-metrics">
              <div className="metric-card">
                <small>Products listed</small>
                <strong>08</strong>
                <span>Demo catalog</span>
              </div>
              <div className="metric-card">
                <small>AI service</small>
                <strong className="metric-pending">Pending</strong>
                <span>Not connected yet</span>
              </div>
            </div>

            <div className="chart-placeholder">
              <div className="chart-heading">
                <strong>Return risk by category</strong>
                <span>Illustrative only</span>
              </div>
              <div className="chart-bars" aria-label="Illustrative chart">
                {[48, 72, 36, 58, 42].map((height, index) => (
                  <div className="chart-column" key={index}>
                    <div
                      className="chart-bar"
                      style={{ height: `${height}%` }}
                    />
                    <small>{["Mob", "Lap", "Aud", "Wear", "Other"][index]}</small>
                  </div>
                ))}
              </div>
              <p className="chart-disclaimer">
                Example visualization, not actual return statistics or model
                predictions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">R</span>
          <span>
            Return<span className="brand-accent">Sense</span>
            <small>SMARTER ELECTRONICS</small>
          </span>
        </a>
        <p>Electronics shopping, with a smarter perspective.</p>
        <span>© {new Date().getFullYear()} ReturnSense · Student project</span>
      </footer>
    </div>
  );
}

export default App;