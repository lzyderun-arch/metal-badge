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
