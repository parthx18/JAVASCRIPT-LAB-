/* ==========================================================================
   AURA PENS - Invoice Generator & Print Bill Handler
   ========================================================================== */

let currentOrderDetails = null;

// Open Checkout Modal
function openCheckoutModal() {
  if (CART.length === 0) {
    showToast("Your cart is empty! Add pens to proceed.");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById("checkout-modal-overlay");
  if (modal) modal.classList.add("active");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal-overlay");
  if (modal) modal.classList.remove("active");
}

// Process Order & Generate Printable Bill
function submitOrderForm(event) {
  event.preventDefault();

  const name = document.getElementById("cust-name").value;
  const email = document.getElementById("cust-email").value;
  const phone = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const city = document.getElementById("cust-city").value;
  const zip = document.getElementById("cust-zip").value;
  const paymentMethod = document.getElementById("cust-payment").value;

  const orderId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const calc = calculateBillSummary();

  currentOrderDetails = {
    orderId,
    dateStr,
    customer: { name, email, phone, address, city, zip, paymentMethod },
    items: [...CART],
    calc
  };

  // Render Invoice View
  renderPrintableInvoice(currentOrderDetails);

  // Close Checkout Modal & Open Order Success & Print Modal
  closeCheckoutModal();
  openInvoiceModal();

  // Clear Cart
  CART = [];
  saveCartState();
  updateCartUI();

  showToast(`Order #${orderId} Placed Successfully!`);
}

// Render Printable Invoice DOM
function renderPrintableInvoice(order) {
  const container = document.getElementById("printable-invoice-view");
  if (!container) return;

  const itemsRows = order.items.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <strong>${item.name}</strong><br>
        <small style="color: #666;">Brand: ${item.brandName} | Nib: ${item.nib} ${item.engraving ? `| Engraving: "${item.engraving}"` : ''}</small>
      </td>
      <td class="num">${item.quantity}</td>
      <td class="num">$${item.price.toFixed(2)}</td>
      <td class="num">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="invoice-paper">
      <!-- Header -->
      <div class="invoice-header-row">
        <div class="invoice-brand">
          <h1>AURA ATELIER</h1>
          <p>Fine Writing Instruments & High Horology Pens</p>
        </div>
        <div class="invoice-meta-box">
          <h2>TAX INVOICE</h2>
          <div><strong>Invoice No:</strong> #${order.orderId}</div>
          <div><strong>Date:</strong> ${order.dateStr}</div>
          <div><strong>GSTIN:</strong> 27AAAAA0000A1Z5</div>
          <div><strong>Payment Status:</strong> PAID (${order.customer.paymentMethod.toUpperCase()})</div>
        </div>
      </div>

      <!-- Address Columns -->
      <div class="invoice-addresses">
        <div class="address-col">
          <h4>Billed To (Customer Details)</h4>
          <strong>${order.customer.name}</strong><br>
          ${order.customer.address}<br>
          ${order.customer.city}, ${order.customer.zip}<br>
          Email: ${order.customer.email}<br>
          Phone: ${order.customer.phone}
        </div>
        <div class="address-col">
          <h4>Shipped From (Merchant)</h4>
          <strong>AURA Atelier Flagship Store</strong><br>
          740 Fifth Avenue, Suite 1800<br>
          New York, NY 10019, USA<br>
          Support: Concierge@aura-pens.com<br>
          Tel: +1 (800) 555-AURA
        </div>
      </div>

      <!-- Itemized Table -->
      <table class="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Description & Specs</th>
            <th style="text-align: right;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals Breakdown Table -->
      <div class="invoice-totals-container">
        <table class="invoice-totals-table">
          <tr>
            <td class="label">Item Subtotal</td>
            <td class="val">$${order.calc.subtotal.toFixed(2)}</td>
          </tr>
          ${order.calc.discountAmount > 0 ? `
            <tr>
              <td class="label">Discount Applied</td>
              <td class="val">-$${order.calc.discountAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td class="label">Packaging Charge</td>
            <td class="val">$${order.calc.packagingFee.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Shipping & Delivery Fee</td>
            <td class="val">$${order.calc.shippingFee.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">GST (18% Tax Rate)</td>
            <td class="val">$${order.calc.gstAmount.toFixed(2)}</td>
          </tr>
          <tr class="grand-total">
            <td class="label">Grand Total Paid</td>
            <td class="val">$${order.calc.grandTotal.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Invoice Footer & Signature -->
      <div class="invoice-footer">
        <div>
          <div class="seal-box">VERIFIED AUTHENTICITY GUARANTEE</div>
          <p style="margin-top: 6px;">Thank you for your purchase. All pens carry a lifetime mechanical warranty.</p>
        </div>
        <div style="text-align: right;">
          <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 14pt; color: #111; border-bottom: 1px solid #111; padding-bottom: 2px;">
            AURA Master Artisan
          </div>
          <small>Authorized Signature</small>
        </div>
      </div>
    </div>
  `;
}

// Invoice Modal Display Functions
function openInvoiceModal() {
  const modal = document.getElementById("invoice-modal-overlay");
  if (modal) modal.classList.add("active");
}

function closeInvoiceModal() {
  const modal = document.getElementById("invoice-modal-overlay");
  if (modal) modal.classList.remove("active");
}

// Trigger Actual Browser Print
function printBillInvoice() {
  window.print();
}
