function formatPrice(value) {
  return `CHF ${value.toFixed(2)}`;
}

function getUniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function renderMarketplace() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const typeFilter = document.getElementById("typeFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const bioFilter = document.getElementById("bioFilter");
  const sortFilter = document.getElementById("sortFilter");
  const resultsCount = document.getElementById("resultsCount");

  // Populate filter lists from shared catalog data.
  getUniqueValues(OGG_PRODUCTS, "category").forEach((category) => {
    categoryFilter.insertAdjacentHTML(
      "beforeend",
      `<option value="${category}">${category}</option>`
    );
  });

  getUniqueValues(OGG_PRODUCTS, "type").forEach((type) => {
    typeFilter.insertAdjacentHTML(
      "beforeend",
      `<option value="${type}">${type}</option>`
    );
  });

  function renderCards(items) {
    resultsCount.textContent = `${items.length} produits`;

    if (!items.length) {
      grid.innerHTML = `
        <article class="empty-state">
          <h3>Aucun produit ne correspond a ces filtres.</h3>
          <p>Essayez d'elargir votre recherche pour voir plus de produits.</p>
        </article>
      `;
      return;
    }

    grid.innerHTML = items
      .map(
        (product) => `
          <article class="product-card-premium">
            <div class="product-media-premium ${product.mediaClass}">
              <span class="card-tag">${product.distance}</span>
              <span class="card-tag">${product.category}</span>
            </div>
            <div class="product-content">
              <div class="product-copy">
                <h3>${product.title}</h3>
                <p>${product.subtitle}</p>
                <small>${product.supplier} - ${product.location}</small>
              </div>
              <div class="product-badges">
                ${product.badges.map((badge) => `<span>${badge}</span>`).join("")}
              </div>
              <span class="product-size">${product.size}</span>
            </div>
            <div class="product-footer">
              <div>
                <strong>${formatPrice(product.price)}</strong>
                <span>${product.unitPrice}</span>
              </div>
              <a class="btn btn-card" href="product-detail.html?product=${product.slug}">
                Voir le produit
              </a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function applyFilters() {
    const searchValue = searchInput.value.trim().toLowerCase();

    let filtered = [...OGG_PRODUCTS].filter((product) => {
      const matchesSearch =
        !searchValue ||
        [
          product.title,
          product.subtitle,
          product.category,
          product.supplier,
          product.type
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        categoryFilter.value === "all" || product.category === categoryFilter.value;
      const matchesType =
        typeFilter.value === "all" || product.type === typeFilter.value;
      const matchesAvailability =
        availabilityFilter.value !== "in-stock" || product.inStock;
      const matchesBio =
        !bioFilter.checked || product.badges.includes("Bio Suisse");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesAvailability &&
        matchesBio
      );
    });

    if (sortFilter.value === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortFilter.value === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortFilter.value === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderCards(filtered);
  }

  [searchInput, categoryFilter, typeFilter, availabilityFilter, bioFilter, sortFilter].forEach(
    (element) => element.addEventListener("input", applyFilters)
  );

  applyFilters();
}

function renderProductDetail() {
  const root = document.getElementById("detailRoot");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("product") || "biscuits-artisanaux";
  const product =
    OGG_PRODUCTS.find((item) => item.slug === slug) ||
    OGG_PRODUCTS.find((item) => item.slug === "biscuits-artisanaux");
  const detail = product.detail || OGG_PRODUCTS.find((item) => item.detail)?.detail;

  const related = OGG_PRODUCTS.filter((item) => item.slug !== product.slug).slice(0, 6);

  root.innerHTML = `
    <div class="breadcrumb-row">
      <a href="marketplace.html">Marketplace</a>
      <span>/</span>
      <a href="marketplace.html">${detail.breadcrumb[0]}</a>
      <span>/</span>
      <a href="marketplace.html">${detail.breadcrumb[1]}</a>
      <span>/</span>
      <strong>${detail.breadcrumb[2]}</strong>
    </div>

    <section class="detail-hero">
      <div class="detail-gallery">
        <div class="gallery-frame">
        <div class="detail-main-image media-detail-biscuits">
          <button class="gallery-nav left" type="button">&lt;</button>
          <button class="gallery-nav right" type="button">&gt;</button>
        </div>
        <div class="gallery-caption">
          <strong>Vue atelier</strong>
          <span>Preparation artisanale et cuisson en petite serie.</span>
        </div>
        </div>
        <div class="detail-thumbs">
          <div class="detail-thumb active media-detail-biscuits"></div>
          <div class="detail-thumb media-thumb-dough"></div>
          <div class="detail-thumb media-thumb-oven"></div>
        </div>

        <div class="transparency-card">
          <div class="transparency-head">
            <div>
              <strong>Transparence des prix</strong>
              <p>Decomposition complete du cout du produit</p>
            </div>
            <span>100% transparent</span>
          </div>
          <div class="transparency-note">
            Nous rendons le prix plus clair pour que l'utilisateur comprenne exactement ce qu'il paie.
          </div>
          <div class="transparency-bars">
            ${detail.transparency
              .map(
                (item) => `
                  <div>
                    <b>${item.share}</b>
                    <span>${item.label}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="detail-summary" id="buy-panel">
        <div class="detail-tags-top">
          ${detail.topTags
            .map((tag, index) => {
              const classes = ["green", "blue", "red", "orange"];
              return `<span class="tag ${classes[index] || "blue"}">${tag}</span>`;
            })
            .join("")}
        </div>
        <a class="report-btn" href="#">Signaler</a>
        <h1>${detail.title}</h1>

        <div class="detail-badges">
          ${detail.trustBadges
            .map((badge, index) => {
              const classes = ["blue", "violet", "rose", "amber"];
              return `<span class="soft-badge ${classes[index] || "blue"}">${badge}</span>`;
            })
            .join("")}
        </div>

        <p class="detail-description">${detail.description}</p>

        <div class="detail-meta-line">
          <span>${detail.breadcrumb[0]} &gt; ${detail.breadcrumb[1]}</span>
          <a href="#">${detail.producer.business}</a>
        </div>
        <div class="stock-line">
          <span class="stock-green">${detail.stock}</span>
          <span>${detail.delivery}</span>
        </div>
        <div class="detail-quick-facts">
          <article>
            <strong>Fabrication</strong>
            <span>Petite serie artisanale</span>
          </article>
          <article>
            <strong>Origine</strong>
            <span>${detail.producer.location}</span>
          </article>
          <article>
            <strong>Format actif</strong>
            <span>${detail.formats.find((format) => format.active)?.label || "100g"}</span>
          </article>
        </div>

        <div class="format-section">
          <h3>Choisissez votre format</h3>
          <div class="format-grid">
            ${detail.formats
              .map(
                (format) => `
                  <button class="format-card ${format.active ? "active" : ""}" type="button">
                    <strong>${format.label}</strong>
                    <span>${format.note}</span>
                    <b>${format.priceLabel}</b>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="buy-card">
          <div class="buy-price-row">
            <div>
              <strong>${detail.mainPrice}</strong>
              <span>${detail.mainUnit}</span>
            </div>
            <small>TVA incluse</small>
          </div>
          <div class="buy-benefits">
            <span>Paiement securise</span>
            <span>Stock confirme</span>
            <span>Expedition rapide</span>
          </div>

          <div class="buy-controls">
            <label>Quantite</label>
            <div class="quantity-box">
              <button type="button">-</button>
              <span>1</span>
              <button type="button">+</button>
            </div>
            <div class="total-box">Total : ${detail.mainPrice}</div>
          </div>

          <a class="add-cart-btn" href="#">Ajouter au panier</a>
          <div class="order-note">${detail.orderNote}</div>
          <a class="terms-link" href="#">Conditions generales de vente</a>
        </div>
      </div>
    </section>

    <div class="detail-tabs">
      <button class="detail-tab active" type="button">Apercu global</button>
      <button class="detail-tab" type="button">Ingredients & Nutrition</button>
      <button class="detail-tab" type="button">Tracabilite</button>
    </div>

    <section class="detail-panel">
      <h2>Details du produit</h2>
      <div class="detail-info-grid">
        <article class="info-card">
          <h3>Conditionnement</h3>
          <p>Sachets recyclables et compostables avec fermeture hermetique.</p>
          <p>Cartons de transport recycles avec calage biodegradable.</p>
          <div class="mini-tags">
            <span>Recyclable</span>
            <span>Compostable</span>
          </div>
        </article>
        <article class="info-card">
          <h3>Conservation</h3>
          <p>Temperature ideale de stockage : 15-20C.</p>
          <p>A conserver a l'abri de l'humidite et de la lumiere directe.</p>
          <p>Duree de conservation : 12 mois.</p>
        </article>
      </div>

      <div class="producer-block">
        <h2>A propos du producteur</h2>
        <div class="producer-card">
          <div class="producer-avatar media-producer"></div>
          <div class="producer-copy">
            <div class="producer-top">
              <div>
                <h3>${detail.producer.name}</h3>
                <p>${detail.producer.business}</p>
              </div>
              <span class="cert-badge">Certifie</span>
            </div>
            <div class="producer-meta">
              <span>${detail.producer.location}</span>
              <span>${detail.producer.website}</span>
            </div>
            <p class="producer-story">
              Une production locale orientee qualite, avec une attention forte
              portee aux ingredients, a la transparence et au circuit court.
            </p>
            <div class="mini-tags">
              ${detail.producer.tags.map((tag) => `<span>${tag}</span>`).join("")}
            </div>
            <p>${detail.producer.productCount}</p>
            <a class="profile-link-btn" href="#">Voir le profil</a>
          </div>
        </div>
      </div>

      <div class="related-block">
        <div class="related-head">
          <h2>Autres produits de ${detail.producer.business}</h2>
          <a href="marketplace.html">Voir tous les produits</a>
        </div>

        <div class="product-grid related-grid">
          ${related
            .map(
              (item) => `
                <article class="product-card-premium">
                  <div class="product-media-premium ${item.mediaClass}">
                    <span class="card-tag">${item.distance}</span>
                    <span class="card-tag">${item.category}</span>
                  </div>
                  <div class="product-content">
                    <div class="product-copy">
                      <h3>${item.title}</h3>
                      <p>${item.subtitle}</p>
                      <small>${item.supplier} - ${item.location}</small>
                    </div>
                    <div class="product-badges">
                      ${item.badges.map((badge) => `<span>${badge}</span>`).join("")}
                    </div>
                    <span class="product-size">${item.size}</span>
                  </div>
                  <div class="product-footer">
                    <div>
                      <strong>${formatPrice(item.price)}</strong>
                      <span>${item.unitPrice}</span>
                    </div>
                    <a class="btn btn-card" href="product-detail.html?product=${item.slug}">
                      Voir le produit
                    </a>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="assurance-strip">
        <article>
          <strong>100% Bio</strong>
          <span>Ingredients issus d'un approvisionnement bio premium.</span>
        </article>
        <article>
          <strong>Local & Suisse</strong>
          <span>Chaine d'approvisionnement locale, plus de confiance et une livraison plus rapide.</span>
        </article>
        <article>
          <strong>Certifie</strong>
          <span>Plusieurs labels qualite mis en valeur dans un parcours d'achat plus clair.</span>
        </article>
      </div>
    </section>
  `;
}

renderMarketplace();
renderProductDetail();
