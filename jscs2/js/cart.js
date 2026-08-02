/* ==========================================================================
   AURA PENS - Shopping Cart & Billing Calculation Manager
   ========================================================================== */

// Global Cart State
let CART = [];
let appliedCoupon = null;
let selectedPackaging = "standard"; // "standard" ($0) or "velvet" ($15)
let selectedShipping = "standard";   // "standard" ($10) or "express" ($25)

const COUPONS = {
  "LUXURY10": 0.10,
  "PARKER15": 0.15,
  "AURA20": 0.20
};

// Initialize Cart from LocalStorage
document.addEventListener("DOMContentLoaded", () => {
  const savedCart = localStorage.getItem("aura_pens_cart");
  if (savedCart) {
    try { CART = JSON.parse(savedCart); } catch(e) { CART = []; }
  }
  updateCartUI();
});

// Save State
function saveCartState() {
  localStorage.setItem("aura_pens_cart", JSON.stringify(CART));
}

// Add Standard Catalog Pen to Cart
function addToCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = CART.findIndex(item => item.id === productId && !item.isCustom);
  if (existingIndex > -1) {
    CART[existingIndex].quantity += 1;
  } else {
    CART.push({
      id: product.id,
      name: product.name,
      brandName: product.brandName,
      price: product.price,
      image: product.image,
      quantity: 1,
      nib: product.specs.nib,
      isCustom: false
    });
  }

  saveCartState();
  updateCartUI();
  showToast(`Added ${product.name} to Shopping Cart!`);
  openCartDrawer();
}

// Add Custom 3D Studio Pen to Cart
function addCustomPenToCart() {
  const engravingInput = document.getElementById("engraving-text-input");
  const engravingText = engravingInput ? engravingInput.value.trim() : "";

  const activeSwatch = document.querySelector(".color-swatch.active");
  const finishName = activeSwatch ? activeSwatch.getAttribute("data-color") : "Obsidian Black";

  const activeNibBtn = document.querySelector(".nib-btn.active");
  const nibName = activeNibBtn ? activeNibBtn.innerText : "18K Gold Medium";

  const customPenItem = {
    id: `custom-${Date.now()}`,
    name: `Custom Atelier Fountain Pen (${finishName})`,
    brandName: "AURA Custom 3D Studio",
    price: 1250,
    image: "images/visconti_watermark.png",
    quantity: 1,
    nib: nibName,
    engraving: engravingText || "None",
    isCustom: true
  };

  CART.push(customPenItem);
  saveCartState();
  updateCartUI();
  showToast("Your Custom 3D Pen has been added to Cart!");
  openCartDrawer();
}

// Update Quantity
function updateCartQty(index, delta) {
  if (CART[index]) {
    CART[index].quantity += delta;
    if (CART[index].quantity <= 0) {
      CART.splice(index, 1);
    }
  }
  saveCartState();
  updateCartUI();
}

// Remove Item
function removeCartItem(index) {
  if (CART[index]) {
    const name = CART[index].name;
    CART.splice(index, 1);
    saveCartState();
    updateCartUI();
    showToast(`Removed ${name} from cart.`);
  }
}

// Apply Promo Coupon Code
function applyCouponCode() {
  const input = document.getElementById("coupon-code-input");
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (COUPONS[code]) {
    appliedCoupon = { code: code, rate: COUPONS[code] };
    showToast(`Coupon ${code} applied! (${COUPONS[code] * 100}% Off)`);
  } else {
    showToast("Invalid Coupon Code. Try LUXURY10 or AURA20.");
    appliedCoupon = null;
  }
  updateCartUI();
}

// Change Options
function setPackaging(type) {
  selectedPackaging = type;
  updateCartUI();
}

function setShipping(type) {
  selectedShipping = type;
  updateCartUI();
}

// Main Financial Calculations Function
function calculateBillSummary() {
  const subtotal = CART.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const discountRate = appliedCoupon ? appliedCoupon.rate : 0;
  const discountAmount = subtotal * discountRate;
  const taxableAmount = subtotal - discountAmount;

  const packagingFee = selectedPackaging === "velvet" ? 15 : 0;
  const shippingFee = selectedShipping === "express" ? 25 : (subtotal > 0 ? 10 : 0);
  
  const gstRate = 0.18; // 18% GST Tax
  const gstAmount = taxableAmount * gstRate;

  const grandTotal = taxableAmount + packagingFee + shippingFee + gstAmount;

  return {
    subtotal,
    discountRate,
    discountAmount,
    taxableAmount,
    packagingFee,
    shippingFee,
    gstRate,
    gstAmount,
    grandTotal
  };
}

// Update Cart Drawer & Badge UI
function updateCartUI() {
  const badge = document.getElementById("cart-badge-count");
  const totalItems = CART.reduce((sum, i) => sum + i.quantity, 0);
  if (badge) badge.innerText = totalItems;

  const container = document.getElementById("cart-drawer-items");
  const summaryContainer = document.getElementById("cart-summary-table-container");

  if (!container) return;

  if (CART.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; color: var(--text-secondary);"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Your shopping cart is empty.</p>
        <button class="btn btn-outline-gold btn-sm" onclick="closeCartDrawer()" style="margin-top: 1rem;">Browse Collection</button>
      </div>
    `;
    if (summaryContainer) summaryContainer.innerHTML = '';
    return;
  }

  // Render Cart Items
  container.innerHTML = CART.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-brand">${item.brandName} ${item.engraving ? `• Engraved: "${item.engraving}"` : ''}</div>
        <div class="cart-item-price">$${item.price}</div>
      </div>
      <div class="cart-qty-controls">
        <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
        <span style="font-family: var(--font-mono); font-size: 0.9rem;">${item.quantity}</span>
        <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
      </div>
      <button onclick="removeCartItem(${idx})" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px;" title="Remove">✕</button>
    </div>
  `).join('');

  // Calculate & Render Summary Table
  const calc = calculateBillSummary();

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <table class="cart-summary-table">
        <tr>
          <td>Subtotal (${totalItems} items)</td>
          <td>$${calc.subtotal.toFixed(2)}</td>
        </tr>
        ${calc.discountAmount > 0 ? `
          <tr style="color: var(--text-gold);">
            <td>Discount (${appliedCoupon.code} - ${(calc.discountRate*100)}%)</td>
            <td>-$${calc.discountAmount.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr>
          <td>Packaging Case</td>
          <td>${calc.packagingFee > 0 ? `$${calc.packagingFee.toFixed(2)}` : 'Standard (Included)'}</td>
        </tr>
        <tr>
          <td>Shipping & Delivery</td>
          <td>$${calc.shippingFee.toFixed(2)}</td>
        </tr>
        <tr>
          <td>GST (18% Tax)</td>
          <td>$${calc.gstAmount.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Grand Total</td>
          <td>$${calc.grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    `;
  }
}

// Drawer Controls
function openCartDrawer() {
  document.getElementById("cart-overlay").classList.add("active");
  document.getElementById("cart-drawer-panel").classList.add("active");
}

function closeCartDrawer() {
  document.getElementById("cart-overlay").classList.remove("active");
  document.getElementById("cart-drawer-panel").classList.remove("active");
}

function toggleCartDrawer() {
  const drawer = document.getElementById("cart-drawer-panel");
  if (drawer.classList.contains("active")) {
    closeCartDrawer();
  } else {
    openCartDrawer();
  }
}
