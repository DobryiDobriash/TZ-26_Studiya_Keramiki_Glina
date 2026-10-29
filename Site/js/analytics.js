/**
 * GA4 + UTM attribution helpers.
 * Include on every page before </body>, after the Google tag (gtag.js) is initialized.
 * Never send name, email, phone, or other personal data to GA4.
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const currentUtm = {};
  keys.forEach((key) => {
    const value = params.get(key);
    if (value) currentUtm[key] = value;
  });

  // Keep campaign attribution during navigation on the site.
  // Session storage is used only for campaign parameters, not personal data.
  if (Object.keys(currentUtm).length) {
    try {
      sessionStorage.setItem('glina_utm', JSON.stringify(currentUtm));
    } catch (_) {}
  }

  let attribution = currentUtm;
  if (!Object.keys(attribution).length) {
    try {
      attribution = JSON.parse(sessionStorage.getItem('glina_utm') || '{}');
    } catch (_) {
      attribution = {};
    }
  }

  function trackCtaClick(el) {
    if (typeof window.gtag !== 'function') return;
    const label = el.getAttribute('data-cta') || el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80);
    window.gtag('event', 'cta_click', {
      cta_label: label || 'unknown',
      cta_location: el.getAttribute('data-cta-location') || 'unspecified',
      link_url: el.href || '',
      ...attribution
    });
  }

  // Mark every external YouTube/Telegram traffic button/link with data-cta.
  document.addEventListener('click', function (event) {
    const el = event.target.closest('[data-cta]');
    if (el) trackCtaClick(el);
  });

  // Form submissions: attach campaign fields to the lead request if matching hidden inputs exist.
  document.querySelectorAll('form').forEach((form) => {
    keys.forEach((key) => {
      let input = form.querySelector('input[name="' + key + '"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        form.appendChild(input);
      }
      input.value = attribution[key] || '';
    });
  });

  // Optional GA4 debug event for checking that the tracking layer loaded.
  window.glinaAnalytics = {
    getUtm: () => ({ ...attribution }),
    trackCta: trackCtaClick
  };
})();
