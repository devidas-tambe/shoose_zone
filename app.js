// ===== STEPUP SHOE STORE - APP.JS =====

// ---- State ----
let cart = JSON.parse(localStorage.getItem('stepup_cart') || '[]');
let orders = JSON.parse(localStorage.getItem('stepup_orders') || '[]');
let currentProduct = null;
let currentPayment = 'upi';
let currentCheckoutStep = 1;
let filteredProducts = [...PRODUCTS];

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderFeaturedProducts();
  renderAllProducts(PRODUCTS);
  startCountdown();
});

// ===== PAGE NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (pageId === 'cart') renderCart();
  if (pageId === 'orders') renderOrders();
  if (pageId === 'checkout') {
    currentCheckoutStep = 1;
    renderReview();
    updateCheckoutSteps(1);
    showCheckoutStep(1);
  }
}

// ===== PRODUCT RENDERING =====
function createProductCard(product) {
  const stars = renderStars(product.rating);
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card" onclick="openProduct(${product.id})">
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        ${product.discount ? `<div class="product-discount">-${product.discount}%</div>` : ''}
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="product-quick-actions">
            <button class="quick-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})" title="Add to Cart">
              <i class="fas fa-cart-plus"></i>
            </button>
            <button class="quick-btn" onclick="event.stopPropagation(); wishlistItem(${product.id})" title="Wishlist">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">${product.brand}</div>
          <h6 class="product-name">${product.name}</h6>
          <div class="product-rating">
            ${stars}
            <span class="review-count">(${product.reviews.toLocaleString()})</span>
          </div>
          <div class="product-price">
            <span class="price-current">₹${product.price.toLocaleString()}</span>
            ${product.originalPrice ? `<span class="price-original">₹${product.originalPrice.toLocaleString()}</span>` : ''}
          </div>
          <div class="free-delivery"><i class="fas fa-truck me-1"></i>Free Delivery</div>
        </div>
      </div>
    </div>
  `;
}

function renderFeaturedProducts() {
  const featured = PRODUCTS.filter(p => p.badge === 'Best Seller' || p.badge === 'Most Loved' || p.badge === 'Trending' || p.badge === 'Iconic').slice(0, 4);
  const container = document.getElementById('featuredProducts');
  if (container) container.innerHTML = featured.map(createProductCard).join('');
}

function renderAllProducts(products) {
  const container = document.getElementById('allProducts');
  if (container) {
    if (products.length === 0) {
      container.innerHTML = `<div class="col-12 text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <p class="text-muted">No products found. Try a different search.</p>
      </div>`;
    } else {
      container.innerHTML = products.map(createProductCard).join('');
    }
  }
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<i class="fas fa-star"></i>';
    else if (i - 0.5 <= rating) html += '<i class="fas fa-star-half-alt"></i>';
    else html += '<i class="far fa-star"></i>';
  }
  return html;
}

// ===== FILTER =====
function filterCategory(category) {
  // Update tab active state
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  event && event.target && event.target.classList.add('active');

  if (category === 'all') {
    filteredProducts = [...PRODUCTS];
  } else {
    filteredProducts = PRODUCTS.filter(p => p.category === category);
  }
  renderAllProducts(filteredProducts);
  showPage('home');
  // Scroll to products
  setTimeout(() => {
    const el = document.getElementById('allProducts');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

// ===== SEARCH =====
function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('searchCategory').value.toLowerCase();
  if (!query) return;

  filteredProducts = PRODUCTS.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || p.category === category;
    return matchesQuery && matchesCategory;
  });
  renderAllProducts(filteredProducts);
  showPage('home');
  setTimeout(() => {
    const el = document.getElementById('allProducts');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSearch();
});

// ===== PRODUCT DETAIL =====
function openProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  currentProduct = product;
  document.getElementById('breadcrumb-product').textContent = product.name;

  const mainImg = product.images[0];
  const thumbs = product.images.map((img, i) => `
    <img src="${img}" class="thumb-img ${i === 0 ? 'active' : ''}" onclick="changeMainImg(this, '${img}')" alt="thumb" />
  `).join('');

  const stars = renderStars(product.rating);
  const sizeBtns = product.sizes.map(s => `
    <button class="size-btn" onclick="selectSize(this, ${s})">${s}</button>
  `).join('');
  const colorBtns = product.colors.map((c, i) => `
    <button class="color-btn ${i === 0 ? 'active' : ''}" onclick="selectColor(this, '${c}')">${c}</button>
  `).join('');
  const features = product.features.map(f => `<li><i class="fas fa-check text-accent me-2"></i>${f}</li>`).join('');

  document.getElementById('productDetail').innerHTML = `
    <div class="row g-4">
      <div class="col-md-5">
        <div class="product-gallery">
          <div class="thumbs-col">${thumbs}</div>
          <div class="main-img-wrap">
            <img src="${mainImg}" id="mainProductImg" class="main-product-img" alt="${product.name}" />
          </div>
        </div>
      </div>
      <div class="col-md-7">
        <div class="product-detail-info">
          <div class="product-brand-tag">${product.brand}</div>
          <h2 class="product-detail-name">${product.name}</h2>
          <div class="detail-rating mb-2">
            ${stars}
            <span class="ms-2 text-muted small">${product.rating} • ${product.reviews.toLocaleString()} ratings</span>
          </div>
          <hr/>
          <div class="detail-price-row">
            <span class="detail-price">₹${product.price.toLocaleString()}</span>
            ${product.originalPrice ? `
              <span class="detail-original">₹${product.originalPrice.toLocaleString()}</span>
              <span class="detail-save">Save ₹${(product.originalPrice - product.price).toLocaleString()} (${product.discount}%)</span>
            ` : ''}
          </div>
          <div class="detail-badges mb-3">
            ${product.badge ? `<span class="badge-pill badge-accent">${product.badge}</span>` : ''}
            <span class="badge-pill badge-free"><i class="fas fa-truck me-1"></i>FREE Delivery</span>
            <span class="badge-pill badge-emi">EMI from ₹${Math.round(product.price / 12).toLocaleString()}/mo</span>
          </div>

          <div class="mb-3">
            <label class="detail-label">Select Size:</label>
            <div class="size-grid" id="sizeGrid">${sizeBtns}</div>
            <a href="#" class="size-guide-link small"><i class="fas fa-ruler me-1"></i>Size Guide</a>
          </div>

          <div class="mb-3">
            <label class="detail-label">Select Color:</label>
            <div class="color-grid">${colorBtns}</div>
          </div>

          <div class="mb-3">
            <label class="detail-label">Quantity:</label>
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty(-1)">−</button>
              <span class="qty-value" id="productQty">1</span>
              <button class="qty-btn" onclick="changeQty(1)">+</button>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn btn-add-cart w-100 mb-2" onclick="addToCartFromDetail()">
              <i class="fas fa-cart-plus me-2"></i>Add to Cart
            </button>
            <button class="btn btn-buy-now w-100" onclick="buyNow()">
              <i class="fas fa-bolt me-2"></i>Buy Now
            </button>
          </div>

          <div class="delivery-info mt-3">
            <div class="delivery-row"><i class="fas fa-truck text-accent me-2"></i>Free delivery on orders above ₹499</div>
            <div class="delivery-row"><i class="fas fa-undo text-accent me-2"></i>30-day easy returns</div>
            <div class="delivery-row"><i class="fas fa-shield-alt text-accent me-2"></i>1 year warranty</div>
          </div>
        </div>
      </div>
    </div>

    <div class="product-tabs mt-5">
      <ul class="nav nav-tabs" id="productTabs">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-desc">Description</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-features">Features</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-reviews">Reviews (${product.reviews.toLocaleString()})</button></li>
      </ul>
      <div class="tab-content product-tab-content">
        <div class="tab-pane fade show active p-3" id="tab-desc">
          <p>${product.description}</p>
        </div>
        <div class="tab-pane fade p-3" id="tab-features">
          <ul class="features-list">${features}</ul>
        </div>
        <div class="tab-pane fade p-3" id="tab-reviews">
          <div class="rating-overview mb-4">
            <div class="big-rating">${product.rating}</div>
            <div>${renderStars(product.rating)}</div>
            <div class="text-muted small">${product.reviews.toLocaleString()} ratings</div>
          </div>
          <div class="review-list" id="reviewList">${generateSampleReviews()}</div>
        </div>
      </div>
    </div>
  `;

  // Render similar
  const similar = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  document.getElementById('similarProducts').innerHTML = similar.map(createProductCard).join('');

  showPage('product');
}

function changeMainImg(thumbEl, imgSrc) {
  document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
  document.getElementById('mainProductImg').src = imgSrc;
}

let selectedSize = null;
let selectedColor = null;
let productQty = 1;

function selectSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = size;
}

function selectColor(btn, color) {
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedColor = color;
}

function changeQty(delta) {
  productQty = Math.max(1, Math.min(10, productQty + delta));
  document.getElementById('productQty').textContent = productQty;
}

function addToCartFromDetail() {
  if (!selectedSize) { showToast('⚠️ Please select a size!', '#e63946'); return; }
  addToCart(currentProduct, selectedSize, selectedColor || currentProduct.colors[0], productQty);
}

function buyNow() {
  if (!selectedSize) { showToast('⚠️ Please select a size!', '#e63946'); return; }
  addToCart(currentProduct, selectedSize, selectedColor || currentProduct.colors[0], productQty);
  showPage('checkout');
}

function quickAddToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  addToCart(product, product.sizes[3] || product.sizes[0], product.colors[0], 1);
}

// ===== CART =====
function addToCart(product, size, color, qty) {
  const existing = cart.find(i => i.id === product.id && i.size === size && i.color === color);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, size, color, qty });
  }
  saveCart();
  updateCartCount();
  showToast(`✅ "${product.name}" added to cart!`, '#2d6a4f');
}

function saveCart() {
  localStorage.setItem('stepup_cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart text-center py-5">
        <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
        <h4>Your cart is empty</h4>
        <p class="text-muted">Looks like you haven't added anything yet.</p>
        <button class="btn btn-checkout mt-2" onclick="showPage('home')">Start Shopping</button>
      </div>`;
    updateSummary();
    return;
  }
  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" onclick="openProduct(${item.id})" />
      <div class="cart-item-details flex-grow-1">
        <div class="cart-item-brand">${item.brand}</div>
        <h6 class="cart-item-name" onclick="openProduct(${item.id})">${item.name}</h6>
        <div class="cart-item-meta">
          <span>Size: <strong>${item.size}</strong></span>
          <span class="ms-3">Color: <strong>${item.color}</strong></span>
        </div>
        <div class="cart-item-price mt-1">
          ₹${item.price.toLocaleString()}
          ${item.originalPrice ? `<span class="original ms-2">₹${item.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <div class="cart-item-actions mt-2">
          <div class="qty-control">
            <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
          <button class="btn btn-link text-danger p-0 ms-3" onclick="removeFromCart(${idx})">
            <i class="fas fa-trash me-1"></i>Remove
          </button>
          <button class="btn btn-link text-muted p-0 ms-3" onclick="saveForLater(${idx})">
            <i class="fas fa-bookmark me-1"></i>Save for Later
          </button>
        </div>
      </div>
    </div>
  `).join('');
  updateSummary();
}

function updateCartQty(idx, delta) {
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart();
  updateCartCount();
  renderCart();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartCount();
  renderCart();
  showToast('Item removed from cart', '#555');
}

function saveForLater(idx) {
  showToast('Saved for later!', '#2d6a4f');
}

function updateSummary() {
  const items = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const originalTotal = cart.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0);
  const discount = originalTotal - subtotal;
  document.getElementById('summaryItems').textContent = items;
  document.getElementById('summarySubtotal').textContent = '₹' + subtotal.toLocaleString();
  document.getElementById('summaryDiscount').textContent = '-₹' + discount.toLocaleString();
  document.getElementById('summaryTotal').textContent = '₹' + subtotal.toLocaleString();
}

// ===== CHECKOUT =====
function goToStep(step) {
  if (step === 2) {
    const firstName = document.getElementById('firstName').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const address1 = document.getElementById('address1').value.trim();
    if (!firstName || !mobile || !address1) {
      showToast('⚠️ Please fill all required fields!', '#e63946'); return;
    }
  }
  currentCheckoutStep = step;
  updateCheckoutSteps(step);
  showCheckoutStep(step);
  if (step === 3) renderReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCheckoutStep(step) {
  document.getElementById('checkout-step-1').classList.add('d-none');
  document.getElementById('checkout-step-2').classList.add('d-none');
  document.getElementById('checkout-step-3').classList.add('d-none');
  document.getElementById('checkout-step-' + step).classList.remove('d-none');
}

function updateCheckoutSteps(current) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('step-indicator-' + i);
    if (el) {
      el.classList.remove('active', 'completed');
      if (i < current) el.classList.add('completed');
      if (i === current) el.classList.add('active');
    }
  }
}

function selectPayment(el, type) {
  document.querySelectorAll('.payment-option').forEach(o => {
    o.classList.remove('active');
    o.querySelector('.payment-radio').innerHTML = '<i class="far fa-circle"></i>';
  });
  el.classList.add('active');
  el.querySelector('.payment-radio').innerHTML = '<i class="fas fa-circle-dot"></i>';
  currentPayment = type;

  ['upi-fields','card-fields','net-fields','wallet-fields','cod-fields'].forEach(id => {
    document.getElementById(id).classList.add('d-none');
  });
  const map = { upi: 'upi-fields', card: 'card-fields', netbanking: 'net-fields', wallet: 'wallet-fields', cod: 'cod-fields' };
  if (map[type]) document.getElementById(map[type]).classList.remove('d-none');
}

function renderReview() {
  const container = document.getElementById('reviewContent');
  if (!container) return;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = cart.reduce((s, i) => s + ((i.originalPrice || i.price) - i.price) * i.qty, 0);

  const addr = {
    name: (document.getElementById('firstName')?.value || 'Customer') + ' ' + (document.getElementById('lastName')?.value || ''),
    mobile: document.getElementById('mobile')?.value || '',
    address1: document.getElementById('address1')?.value || '',
    address2: document.getElementById('address2')?.value || '',
    city: document.getElementById('city')?.value || '',
    state: document.getElementById('state')?.value || '',
    pin: document.getElementById('pincode')?.value || ''
  };

  const payLabels = { upi: 'UPI Payment', card: 'Credit/Debit Card', netbanking: 'Net Banking', wallet: 'Wallet', cod: 'Cash on Delivery' };

  container.innerHTML = `
    <div class="review-section">
      <h6 class="review-section-title"><i class="fas fa-map-marker-alt me-2"></i>Delivery Address</h6>
      <p class="mb-0">${addr.name} | ${addr.mobile}</p>
      <p class="mb-0 text-muted">${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}</p>
      <p class="text-muted">${addr.city}, ${addr.state} – ${addr.pin}</p>
    </div>
    <div class="review-section">
      <h6 class="review-section-title"><i class="fas fa-credit-card me-2"></i>Payment</h6>
      <p>${payLabels[currentPayment] || 'UPI Payment'}</p>
    </div>
    <div class="review-section">
      <h6 class="review-section-title"><i class="fas fa-box me-2"></i>Items (${cart.length})</h6>
      ${cart.map(i => `
        <div class="review-item">
          <img src="${i.image}" alt="${i.name}" />
          <div>
            <div class="fw-semibold">${i.name}</div>
            <div class="small text-muted">Size: ${i.size} | Color: ${i.color} | Qty: ${i.qty}</div>
            <div class="fw-bold">₹${(i.price * i.qty).toLocaleString()}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="review-totals">
      <div class="summary-row"><span>Subtotal:</span><span>₹${subtotal.toLocaleString()}</span></div>
      <div class="summary-row text-success"><span>Total Savings:</span><span>-₹${discount.toLocaleString()}</span></div>
      <div class="summary-row"><span>Shipping:</span><span class="text-success">FREE</span></div>
      <hr/>
      <div class="summary-row total-row"><span>Total Amount:</span><span>₹${subtotal.toLocaleString()}</span></div>
    </div>
  `;
}

function placeOrder() {
  const orderId = 'SU' + Date.now().toString().slice(-8);
  const order = {
    id: orderId,
    date: new Date().toLocaleDateString('en-IN'),
    items: [...cart],
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'Confirmed',
    address: {
      name: (document.getElementById('firstName')?.value || 'Customer') + ' ' + (document.getElementById('lastName')?.value || ''),
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || ''
    }
  };
  orders.unshift(order);
  localStorage.setItem('stepup_orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  updateCartCount();
  document.getElementById('orderId').textContent = orderId;
  showPage('success');
}

// ===== ORDERS =====
function renderOrders() {
  const container = document.getElementById('ordersList');
  if (orders.length === 0) {
    container.innerHTML = `<div class="text-center py-5">
      <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
      <h4>No orders yet</h4>
      <p class="text-muted">Your orders will appear here.</p>
      <button class="btn btn-checkout" onclick="showPage('home')">Start Shopping</button>
    </div>`;
    return;
  }
  const statusColors = { Confirmed: 'success', Shipped: 'info', Delivered: 'primary', Cancelled: 'danger' };
  container.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-id">Order # ${o.id}</div>
          <div class="text-muted small">Placed on ${o.date}</div>
        </div>
        <div>
          <span class="order-status status-${statusColors[o.status] || 'secondary'}">${o.status}</span>
          <div class="fw-bold mt-1">₹${o.total.toLocaleString()}</div>
        </div>
      </div>
      <div class="order-items">
        ${o.items.map(i => `
          <div class="order-item-row">
            <img src="${i.image}" alt="${i.name}" />
            <div>
              <div class="fw-semibold">${i.name}</div>
              <div class="text-muted small">Size: ${i.size} | Qty: ${i.qty}</div>
            </div>
            <div class="fw-bold">₹${(i.price * i.qty).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
      <div class="order-footer">
        <span class="text-muted small"><i class="fas fa-truck me-1"></i>Estimated delivery in 3-5 business days</span>
        <button class="btn btn-sm btn-outline-accent" onclick="showToast('Tracking info coming soon!', '#555')">Track Order</button>
      </div>
    </div>
  `).join('');
}

// ===== TOAST =====
function showToast(message, color = '#2d6a4f') {
  const toastEl = document.getElementById('cartToast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = message;
  toastEl.style.background = color;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

function wishlistItem(id) {
  showToast('❤️ Added to wishlist!', '#e63946');
}

// ===== COUNTDOWN =====
function startCountdown() {
  let totalSeconds = 8 * 3600 + 45 * 60 + 30;
  const tick = () => {
    if (totalSeconds <= 0) return;
    totalSeconds--;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(s).padStart(2, '0');
  };
  setInterval(tick, 1000);
}

// ===== SAMPLE REVIEWS =====
function generateSampleReviews() {
  const reviews = [
    { name: 'Rahul S.', rating: 5, text: 'Absolutely love these shoes! Great quality and very comfortable. Perfect fit and fast delivery.', date: '15 Apr 2025' },
    { name: 'Priya M.', rating: 4, text: 'Very nice looking shoes. The quality is great but slightly narrow for wide feet. Overall happy with the purchase.', date: '10 Apr 2025' },
    { name: 'Arjun K.', rating: 5, text: 'Best purchase I have made in a long time. Wore them immediately and so comfortable all day long!', date: '5 Apr 2025' }
  ];
  return reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-avatar">${r.name[0]}</div>
        <div>
          <div class="fw-semibold">${r.name}</div>
          <div class="small text-muted">${r.date}</div>
        </div>
        <div class="ms-auto">${renderStars(r.rating)}</div>
      </div>
      <p class="mb-0 mt-2">${r.text}</p>
      <div class="review-helpful mt-2">
        <button class="btn btn-sm btn-outline-secondary py-0"><i class="fas fa-thumbs-up me-1"></i>Helpful</button>
      </div>
    </div>
  `).join('');
}