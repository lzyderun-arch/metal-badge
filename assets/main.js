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
