window.Tawk_API = window.Tawk_API || {};
window.Tawk_LoadStart = new Date();

(function () {
  function trackTawkEvent(eventName, extraParams) {
    if (typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", eventName, {
      event_category: "Tawk.to",
      page_location: window.location.href,
      page_title: document.title,
      ...extraParams,
    });
  }

  window.Tawk_API.onLoad = function () {
    trackTawkEvent("tawk_chat_loaded");
  };

  window.Tawk_API.onChatMaximized = function () {
    trackTawkEvent("tawk_chat_opened");
  };

  window.Tawk_API.onChatMinimized = function () {
    trackTawkEvent("tawk_chat_minimized");
  };

  window.Tawk_API.onChatStarted = function () {
    trackTawkEvent("tawk_chat_started");
  };

  window.Tawk_API.onPrechatSubmit = function () {
    trackTawkEvent("tawk_prechat_submitted");
  };

  window.Tawk_API.onOfflineSubmit = function () {
    trackTawkEvent("tawk_offline_message_submitted");
  };

  var s1 = document.createElement("script");
  var s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = "https://embed.tawk.to/6a4e69a4a6558f1d451fd472/1jt14pbgj";
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  s0.parentNode.insertBefore(s1, s0);
})();
