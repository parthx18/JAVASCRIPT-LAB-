/* ==========================================================================
   AURA PENS - Catalog Data & Main App Logic
   ========================================================================== */

// 1. Pens Product Database
const PRODUCTS_DATA = [
  {
    id: "mb-149",
    name: "Montblanc Meisterstück 149",
    brand: "montblanc",
    brandName: "Montblanc",
    category: "Fountain Pen",
    price: 980,
    rating: 5.0,
    reviewsCount: 142,
    image: "images/montblanc_meisterstuck.png",
    tag: "Iconic Flagship",
    description: "The crown jewel of writing instruments. Deep black precious resin with gold-coated details, crowned by the white star emblem and handcrafted 18K gold nib.",
    specs: {
      nib: "18K Gold Bi-Color (Fine/Medium)",
      filling: "Piston Mechanism",
      barrel: "Deep Black Precious Resin",
      weight: "32g",
      origin: "Hamburg, Germany"
    }
  },
  {
    id: "vis-homo-sapiens",
    name: "Visconti Homo Sapiens Bronze",
    brand: "visconti",
    brandName: "Visconti",
    category: "Fountain Pen",
    price: 895,
    rating: 4.9,
    reviewsCount: 98,
    image: "images/visconti_homo_sapiens.png",
    tag: "Volcanic Lava",
    description: "Forged from ancient Mt. Etna basaltic lava combined with resin. Virtually unbreakable, hygroscopic, and trimmed with solid warm bronze.",
    specs: {
      nib: "18K Gold Dreamtouch (Medium)",
      filling: "Power Filler Vacuum System",
      barrel: "Volcanic Basaltic Lava",
      weight: "43g",
      origin: "Florence, Italy"
    }
  },
  {
    id: "pk-duofold",
    name: "Parker Duofold Centennial Red",
    brand: "parker",
    brandName: "Parker",
    category: "Fountain Pen",
    price: 650,
    rating: 4.8,
    reviewsCount: 115,
    image: "images/parker_duofold.png",
    tag: "Heritage Craft",
    description: "An emblem of Parker heritage since 1921. Crafted from precious red marbled cast acrylic with 23K gold-plated accents and 18K solid gold nib.",
    specs: {
      nib: "18K Solid Gold Arrow Engraved",
      filling: "Cartridge / Deluxe Converter",
      barrel: "Marbled Cast Acrylic",
      weight: "29g",
      origin: "Nantes, France"
    }
  },
  {
    id: "cr-townsend",
    name: "Cross Townsend 23K Gold",
    brand: "cross",
    brandName: "Cross",
    category: "Fountain Pen",
    price: 520,
    rating: 4.7,
    reviewsCount: 76,
    image: "images/cross_townsend.png",
    tag: "Presidential Select",
    description: "The classic American luxury pen preferred by US Presidents. Finished in 23K heavy gold plate with subtle incised line patterns and 18K nib.",
    specs: {
      nib: "18K Gold Plated Nib",
      filling: "Threaded Converter / Cartridge",
      barrel: "23K Gold Heavy Plate",
      weight: "36g",
      origin: "Rhode Island, USA"
    }
  },
  {
    id: "vis-watermark-le",
    name: "Visconti Watermark 18K Skeleton",
    brand: "limited",
    brandName: "Visconti Limited",
    category: "Limited Edition",
    price: 1850,
    rating: 5.0,
    reviewsCount: 31,
    image: "images/visconti_watermark.png",
    tag: "Limited #48/88",
    description: "Ultra rare skeleton masterpiece cut from a single tube of solid 18K Sterling Silver featuring Visconti's iconic cutout motif over deep blue resin.",
    specs: {
      nib: "18K Gold Palladium Plated",
      filling: "Double Reservoir Power Filler",
      barrel: "Solid 18K Silver Cutout Filigree",
      weight: "54g",
      origin: "Florence, Italy"
    }
  },
  {
    id: "pk-sonnet-silver",
    name: "Parker Sonnet Sterling Silver Ciselé",
    brand: "parker",
    brandName: "Parker",
    category: "Fountain Pen",
    price: 420,
    rating: 4.8,
    reviewsCount: 84,
    image: "images/parker_duofold.png",
    tag: "Pure Silver",
    description: "Timeless elegance with Parker's hallmark grid pattern chiseling on solid 925 sterling silver, completed with gold-plated trim.",
    specs: {
      nib: "18K Solid Gold Fine Nib",
      filling: "Twin Channel Ink Converter",
      barrel: "925 Sterling Silver Ciselé",
      weight: "31g",
      origin: "Nantes, France"
    }
  },
  {
    id: "mb-heritage-spider",
    name: "Montblanc Heritage Rouge & Noir",
    brand: "montblanc",
    brandName: "Montblanc",
    category: "Vintage Special",
    price: 1100,
    rating: 4.9,
    reviewsCount: 53,
    image: "images/montblanc_meisterstuck.png",
    tag: "Heritage Vintage",
    description: "Reinterpreting the classic 1906 Montblanc safety pen with a serpentine spider clip adorned with ruby eyes and coral red lacquer.",
    specs: {
      nib: "14K Gold Serpent Engraved",
      filling: "Piston Filling System",
      barrel: "Coral Red Lacquer & Resin",
      weight: "35g",
      origin: "Hamburg, Germany"
    }
  },
  {
    id: "cr-peerless-125",
    name: "Cross Peerless 125 Heavy Gold",
    brand: "cross",
    brandName: "Cross",
    category: "Fountain Pen",
    price: 610,
    rating: 4.7,
    reviewsCount: 42,
    image: "images/cross_townsend.png",
    tag: "Swarovski Crystal",
    description: "Designed to celebrate 125 years of Cross heritage. Features a brilliant faceted Swarovski crystal set into the cap top.",
    specs: {
      nib: "18K Solid Gold Nib",
      filling: "Cross Threaded Converter",
      barrel: "Heavy 23K Gold Plated",
      weight: "41g",
      origin: "Rhode Island, USA"
    }
  }
];

// Current State
let currentBrandFilter = "all";
let searchQuery = "";

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  setupEventListeners();
  setupHeaderScroll();
});

// Setup Sticky Header Effect
function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Render Catalog Grid
function renderCatalog() {
  const container = document.getElementById("catalog-grid-container");
  if (!container) return;

  const filtered = PRODUCTS_DATA.filter(p => {
    const matchesBrand = currentBrandFilter === "all" || p.brand === currentBrandFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
        <i class="lucide-pen-tool" style="font-size: 3rem; color: var(--accent-gold); margin-bottom: 1rem;"></i>
        <h3>No pens found matching your criteria</h3>
        <p>Try searching for another luxury brand like Montblanc, Parker, or Visconti.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => `
    <div class="product-card glass-panel" data-id="${product.id}">
      <span class="product-tag">${product.tag}</span>
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
        <button class="product-quick-view-btn" onclick="openQuickView('${product.id}')" title="Quick View Specs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <div class="product-details">
        <span class="product-brand">${product.brandName}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-specs-mini">
          <span>Nib: ${product.specs.nib.split(' ')[0]} ${product.specs.nib.split(' ')[1]}</span>
          <span>•</span>
          <span>${product.specs.weight}</span>
        </div>
        <div class="product-footer">
          <div class="product-price">$${product.price}</div>
          <button class="btn btn-gold btn-sm" onclick="addToCart('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Event Listeners for Filters & Search
function setupEventListeners() {
  // Brand Filter Buttons
  const filterBtns = document.querySelectorAll(".brand-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentBrandFilter = btn.getAttribute("data-brand");
      renderCatalog();
    });
  });

  // Search Input
  const searchInput = document.getElementById("search-pens-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }
}

// Open Detailed Quick View Modal
function openQuickView(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("product-modal-overlay");
  const container = document.getElementById("product-modal-content");

  container.innerHTML = `
    <button class="modal-close-btn" onclick="closeProductModal()">✕</button>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
      <div style="background: radial-gradient(circle at center, rgba(30, 35, 50, 0.8), rgba(9,10,15,0.95)); border-radius: var(--radius-md); padding: 2rem; text-align: center; border: 1px solid var(--border-glass);">
        <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 300px; object-fit: contain; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.8));">
      </div>
      <div>
        <span class="tagline">${product.brandName} • ${product.category}</span>
        <h2 style="font-size: 1.8rem; margin-bottom: 0.75rem;">${product.name}</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem;">${product.description}</p>
        
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.5rem; font-size: 0.88rem;">
          <h4 style="color: var(--text-gold); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Craft & Technical Specs</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; color: var(--text-secondary);">
            <div><strong>Nib:</strong> ${product.specs.nib}</div>
            <div><strong>Filling:</strong> ${product.specs.filling}</div>
            <div><strong>Barrel:</strong> ${product.specs.barrel}</div>
            <div><strong>Weight:</strong> ${product.specs.weight}</div>
            <div><strong>Craft Origin:</strong> ${product.specs.origin}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-family: var(--font-heading); font-size: 2rem; color: var(--text-gold); font-weight: 700;">$${product.price}</div>
          <button class="btn btn-gold" onclick="addToCart('${product.id}'); closeProductModal();">
            Add to Shopping Cart
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal-overlay");
  modal.classList.remove("active");
}

// Toast Notifications
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
