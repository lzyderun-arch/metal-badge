const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const QUOTE_PENDING_KEY = "badgecraft_quote_pending";
const SALES_WHATSAPP_NUMBER = "8619520704162";
const SALES_EMAIL = "appleliao2022@gmail.com";

function buildWhatsAppUrl(source) {
  const message = [
    "Hello, I would like a quote for custom metal products.",
    `Page: ${document.title}`,
    `URL: ${window.location.href}`,
    `Source: ${source}`,
  ].join("\n");

  return `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function sendAnalyticsEvent(eventName, parameters = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    transport_type: "beacon",
    ...parameters,
  });
}

function cleanText(element) {
  return (element.textContent || element.getAttribute("aria-label") || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function addHeaderContactLinks() {
  const header = document.querySelector(".site-header");

  if (!header || header.querySelector(".header-contact-bar")) {
    return;
  }

  const contactBar = document.createElement("div");
  contactBar.className = "header-contact-bar";
  contactBar.innerHTML = `
    <div class="header-contact-inner">
      <a href="${buildWhatsAppUrl("header_contact")}" target="_blank" rel="noopener">WhatsApp: +86 19520704162</a>
      <a href="mailto:${SALES_EMAIL}">Email: ${SALES_EMAIL}</a>
    </div>
  `;
  header.insertBefore(contactBar, header.firstChild);
}

function addWhatsAppConversionLinks() {
  if (!document.querySelector(".whatsapp-float")) {
    const floatingLink = document.createElement("a");
    floatingLink.className = "whatsapp-float";
    floatingLink.href = buildWhatsAppUrl("floating_button");
    floatingLink.target = "_blank";
    floatingLink.rel = "noopener";
    floatingLink.setAttribute("aria-label", "Contact BadgeCraft Metalworks on WhatsApp");
    floatingLink.textContent = "WhatsApp";
    document.body.appendChild(floatingLink);
  }

  const isProductPage = window.location.pathname.replace(/\/$/, "").startsWith("/products/");
  const heroActions = document.querySelector(".product-hero .hero-actions");

  if (!isProductPage || !heroActions || heroActions.querySelector('a[href*="wa.me"]')) {
    return;
  }

  const heroWhatsAppLink = document.createElement("a");
  heroWhatsAppLink.className = "btn whatsapp";
  heroWhatsAppLink.href = buildWhatsAppUrl("product_hero");
  heroWhatsAppLink.target = "_blank";
  heroWhatsAppLink.rel = "noopener";
  heroWhatsAppLink.textContent = "Contact on WhatsApp";
  heroActions.appendChild(heroWhatsAppLink);
}

addHeaderContactLinks();
addWhatsAppConversionLinks();

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");

  if (!link) {
    return;
  }

  const rawHref = link.getAttribute("href") || "";
  const linkText = cleanText(link);

  if (/^(?:https?:\/\/)?(?:api\.)?wa\.me\//i.test(rawHref) || /whatsapp\.com/i.test(rawHref)) {
    sendAnalyticsEvent("whatsapp_click", {
      contact_method: "whatsapp",
      contact_target: "sales_whatsapp",
    });
    return;
  }

  if (rawHref.toLowerCase().startsWith("mailto:")) {
    sendAnalyticsEvent("email_click", {
      contact_method: "email",
      contact_target: "sales_email",
    });
    return;
  }

  let destination;
  try {
    destination = new URL(link.href, window.location.href);
  } catch {
    return;
  }

  const isQuoteLink = destination.origin === window.location.origin
    && destination.pathname.replace(/\/$/, "") === "/contact"
    && /quote|contact|inquiry|enquiry/i.test(linkText);

  if (isQuoteLink) {
    sendAnalyticsEvent("quote_request_click", {
      link_url: destination.href,
      link_text: linkText,
      source_page: window.location.pathname,
    });
  }
});

document.querySelectorAll('form[action*="formsubmit.co"]').forEach((form) => {
  form.addEventListener("submit", () => {
    if (!form.checkValidity()) {
      return;
    }

    const productField = form.elements.namedItem("product");
    const productType = productField && "value" in productField
      ? String(productField.value).slice(0, 100)
      : "custom metal craft";

    try {
      window.sessionStorage.setItem(QUOTE_PENDING_KEY, JSON.stringify({
        productType,
        submittedAt: Date.now(),
      }));
    } catch {
      // Analytics storage must never prevent the quote form from submitting.
    }

    sendAnalyticsEvent("quote_form_submit", {
      form_name: "request_quote",
      product_type: productType,
    });
  });
});

if (window.location.pathname.replace(/\/$/, "") === "/thanks") {
  try {
    const pendingQuote = JSON.parse(window.sessionStorage.getItem(QUOTE_PENDING_KEY));
    const isRecentSubmission = pendingQuote
      && Number.isFinite(pendingQuote.submittedAt)
      && Date.now() - pendingQuote.submittedAt < 30 * 60 * 1000;

    if (isRecentSubmission) {
      sendAnalyticsEvent("generate_lead", {
        lead_source: "website_quote_form",
        form_name: "request_quote",
        product_type: pendingQuote.productType,
      });
      sendAnalyticsEvent("quote_form_success", {
        form_name: "request_quote",
        product_type: pendingQuote.productType,
      });
      window.sessionStorage.removeItem(QUOTE_PENDING_KEY);
    }
  } catch {
    window.sessionStorage.removeItem(QUOTE_PENDING_KEY);
  }
}

function initBadgeConfigurator() {
  const form = document.querySelector("#badge-configurator");
  if (!form) return;

  const get = (id) => document.getElementById(id);
  const selected = (name) => form.querySelector(`input[name="${name}"]:checked`);
  const selectedLabel = (name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field?.tagName === "SELECT") return field.options[field.selectedIndex]?.textContent || "Not selected";
    return selected(name)?.dataset.label || "Not selected";
  };
  const safeNumber = (id, fallback) => {
    const value = Number(get(id)?.value);
    return Number.isFinite(value) ? value : fallback;
  };

  const finishColors = {
    "bright-silver": "#cbd0d6",
    "antique-gold": "#b68a46",
    "antique-silver": "#8b9198",
    "black-nickel": "#454b54",
    "brushed-metal": "#a9afb4",
  };
  const enamelColors = {
    none: "#56616b",
    "soft-enamel": "#234d79",
    "hard-enamel": "#9c302b",
    "printed-color": "#b56d24",
  };
  const baseByMaterial = { zinc: 1.95, brass: 1.65, iron: 1.45, stainless: 1.75 };
  const finishAdd = { "bright-silver": .1, "antique-gold": .18, "antique-silver": .14, "black-nickel": .2, "brushed-metal": .16 };
  const enamelAdd = { none: 0, "soft-enamel": .35, "hard-enamel": .55, "printed-color": .4 };
  const backingAdd = { "butterfly-clutch": .12, magnetic: .4, "safety-pin": .18, "screw-post": .25, adhesive: .1 };
  const packagingAdd = { "bulk-carton": 0, "individual-bag": .12, "backing-card": .28, "gift-box": .65 };

  const summaryText = () => {
    const artwork = get("badge-artwork")?.files?.[0]?.name || "Not attached";
    return [
      "Hello, I would like a quote for a custom metal badge.",
      `Application: ${selectedLabel("application")}`,
      `Size: ${safeNumber("badge-width", 1.5).toFixed(2)} x ${safeNumber("badge-height", 1.25).toFixed(2)} in`,
      `Quantity: ${Math.max(100, Math.round(safeNumber("badge-quantity", 100)))} pcs`,
      `Material: ${selectedLabel("material")}`,
      `Finish: ${selectedLabel("finish")}`,
      `Enamel: ${selectedLabel("enamel")}`,
      `Backing: ${selectedLabel("backing")}`,
      `Shape: ${selectedLabel("shape")}`,
      `Back: ${selectedLabel("back")}`,
      `Packaging: ${selectedLabel("packaging")}`,
      `Line 1: ${get("badge-line-1")?.value.trim() || "None"}`,
      `Line 2: ${get("badge-line-2")?.value.trim() || "None"}`,
      `Artwork: ${artwork}`,
      `Instructions: ${get("badge-instructions")?.value.trim() || "None"}`,
      "Page: https://metal-badge.com/design-custom-badge",
    ].join("\n");
  };

  function update() {
    const material = selected("material")?.value || "zinc";
    const finish = selected("finish")?.value || "bright-silver";
    const enamel = selected("enamel")?.value || "none";
    const backing = selected("backing")?.value || "butterfly-clutch";
    const shape = selected("shape")?.value || "custom-silhouette";
    const back = selected("back")?.value || "shell";
    const packaging = selected("packaging")?.value || "bulk-carton";
    const quantity = Math.max(100, Math.round(safeNumber("badge-quantity", 100)));
    const width = safeNumber("badge-width", 1.5);
    const height = safeNumber("badge-height", 1.25);
    const line1 = get("badge-line-1")?.value.trim() || "YOUR BADGE";
    const line2 = get("badge-line-2")?.value.trim() || "";
    const preview = get("badge-preview");
    if (preview) {
      preview.style.setProperty("--badge-metal", finishColors[finish] || finishColors["bright-silver"]);
      preview.style.setProperty("--badge-enamel", enamelColors[enamel] || enamelColors.none);
    }
    if (get("preview-line-1")) get("preview-line-1").textContent = line1;
    if (get("preview-line-2")) get("preview-line-2").textContent = line2;
    const setText = (id, textValue) => { if (get(id)) get(id).textContent = textValue; };
    setText("summary-application", selectedLabel("application"));
    setText("summary-size", `${width.toFixed(2)} × ${height.toFixed(2)} in`);
    setText("summary-quantity", `${quantity.toLocaleString()} pcs`);
    setText("summary-material", selectedLabel("material"));
    setText("summary-finish", selectedLabel("finish"));
    setText("summary-enamel", selectedLabel("enamel"));
    setText("summary-backing", selectedLabel("backing"));
    setText("summary-shape", `${selectedLabel("shape")} / ${selectedLabel("back")}`);
    setText("summary-packaging", selectedLabel("packaging"));
    const pieceBase = (baseByMaterial[material] || 1.95) + (finishAdd[finish] || 0) + (enamelAdd[enamel] || 0) + (backingAdd[backing] || 0) + (packagingAdd[packaging] || 0);
    const sizeFactor = Math.max(.82, Math.min(2.4, (width * height) / 1.875));
    const volumeFactor = quantity >= 1000 ? .85 : quantity >= 500 ? .92 : 1;
    const tooling = 65 + (shape === "custom-silhouette" ? 25 : 0) + (back === "solid" ? 13 : 0);
    const low = Math.round(tooling + quantity * pieceBase * sizeFactor * volumeFactor * .85);
    const high = Math.round(tooling + quantity * pieceBase * sizeFactor * volumeFactor * 1.15);
    setText("estimate-range", `USD $${low.toLocaleString()}–$${high.toLocaleString()}`);
    const whatsapp = get("badge-whatsapp");
    if (whatsapp) whatsapp.href = `https://wa.me/8619520704162?text=${encodeURIComponent(summaryText())}`;
    const artwork = get("badge-artwork")?.files?.[0]?.name;
    setText("artwork-name", artwork ? `Selected file: ${artwork}` : "Attach a logo, sketch or reference image when available.");
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", update);
    field.addEventListener("change", update);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const whatsapp = get("badge-whatsapp");
    if (whatsapp) window.open(whatsapp.href, "_blank", "noopener");
  });
  get("badge-copy")?.addEventListener("click", async () => {
    const status = get("badge-copy-status");
    try {
      await navigator.clipboard.writeText(summaryText());
      if (status) status.textContent = "Specification copied. Paste it into email or WhatsApp.";
    } catch {
      if (status) status.textContent = "Copy was blocked by the browser. Use the WhatsApp button instead.";
    }
  });
  update();
}

initBadgeConfigurator();
