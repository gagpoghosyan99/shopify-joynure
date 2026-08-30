/**
 * JOYNURE Hula final CTA — keeps bottom color buttons in sync with
 * the authoritative product variant picker (one variant state).
 */
class JoynureHulaFinalCta extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll('[data-joynure-hula-color]')];
    this.atc = this.querySelector('[data-joynure-hula-final-atc]');
    this.price = this.querySelector('[data-joynure-hula-final-price]');
    this.media = this.querySelector('[data-joynure-hula-final-media]');
    this.form = document.querySelector('product-form-component form[data-type="add-to-cart-form"], form[action*="/cart/add"]');
    this.variantInput = document.querySelector('product-form-component [name="id"], form[action*="/cart/add"] [name="id"]');

    this.onClick = this.onClick.bind(this);
    this.onVariantChange = this.onVariantChange.bind(this);

    this.buttons.forEach((btn) => btn.addEventListener('click', this.onClick));
    document.addEventListener('change', this.onVariantChange);
    this.syncFromPicker();
  }

  disconnectedCallback() {
    this.buttons.forEach((btn) => btn.removeEventListener('click', this.onClick));
    document.removeEventListener('change', this.onVariantChange);
  }

  onClick(event) {
    const btn = event.currentTarget;
    const variantId = btn.getAttribute('data-variant-id');
    const label = btn.getAttribute('data-display-label');
    if (!variantId) return;

    // Prefer selecting the matching radio in the main picker so Horizon state stays authoritative.
    const radios = [...document.querySelectorAll('variant-picker input[type="radio"][data-variant-id], .variant-option input[type="radio"][data-variant-id]')];
    const match = radios.find((r) => String(r.getAttribute('data-variant-id')) === String(variantId));
    if (match) {
      match.click();
    } else if (this.variantInput) {
      this.variantInput.value = variantId;
      this.variantInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    this.setPressed(label);
    this.updateLocal(btn);
  }

  onVariantChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.type !== 'radio') return;
    if (!target.closest('variant-picker, .variant-picker, product-form-component')) return;
    this.syncFromPicker();
  }

  syncFromPicker() {
    const checked = document.querySelector(
      'variant-picker input[type="radio"][data-variant-id]:checked, .variant-option input[type="radio"][data-variant-id]:checked'
    );
    if (!checked) return;
    const variantId = checked.getAttribute('data-variant-id');
    const label =
      checked.getAttribute('data-display-label') ||
      checked.getAttribute('aria-label') ||
      checked.value;
    const btn = this.buttons.find((b) => String(b.getAttribute('data-variant-id')) === String(variantId));
    this.setPressed(btn?.getAttribute('data-display-label') || this.cleanLabel(label));
    if (btn) this.updateLocal(btn);
  }

  cleanLabel(label) {
    return String(label || '')
      .replace(/color box/gi, '')
      .replace(/24\s*sections?/gi, '')
      .trim();
  }

  setPressed(label) {
    const needle = this.cleanLabel(label).toLowerCase();
    this.buttons.forEach((btn) => {
      const pressed = this.cleanLabel(btn.getAttribute('data-display-label')).toLowerCase() === needle;
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });
  }

  updateLocal(btn) {
    if (this.price && btn.dataset.price) {
      this.price.textContent = btn.dataset.price;
    }
    if (this.media && btn.dataset.image) {
      this.media.setAttribute('src', btn.dataset.image);
      this.media.setAttribute('alt', `${btn.getAttribute('data-display-label')} Smart Weighted Hula Hoop`);
    }
    if (this.atc && btn.dataset.variantId) {
      this.atc.setAttribute('data-variant-id', btn.dataset.variantId);
    }
  }
}

if (!customElements.get('joynure-hula-final-cta')) {
  customElements.define('joynure-hula-final-cta', JoynureHulaFinalCta);
}

document.addEventListener('click', (event) => {
  const atc = event.target.closest('[data-joynure-hula-final-atc]');
  if (!atc) return;
  event.preventDefault();
  const mainAtc = document.querySelector(
    'product-form-component button[type="submit"], product-form-component .add-to-cart-button, buy-buttons-component button[type="submit"]'
  );
  if (mainAtc) {
    mainAtc.click();
    return;
  }
  // Fallback: scroll to buy box
  document.querySelector('buy-buttons-component, product-form-component, .buy-buttons')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
});
