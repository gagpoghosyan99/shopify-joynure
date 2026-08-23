class JoynureCategoryInteractor extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.activeIndex = 0;
    this.triggers = Array.from(this.querySelectorAll('[data-joynure-category-trigger]'));
    this.image = this.querySelector('[data-joynure-category-image]');
    this.stage = this.querySelector('[data-joynure-category-stage]');
    this.tiles = Array.from(this.querySelectorAll('[data-tile-index]'));
    this.caption = this.querySelector('[data-joynure-category-caption]');
    this.tagline = this.querySelector('[data-joynure-category-tagline]');
    this.timers = [];
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.triggers.forEach((trigger, index) => {
      trigger.addEventListener('mouseenter', () => this.activate(index));
      trigger.addEventListener('focus', () => this.activate(index));
      trigger.addEventListener('click', (event) => {
        if (index !== this.activeIndex && !window.matchMedia('(hover: hover)').matches) {
          event.preventDefault();
          this.activate(index);
        }
      });
    });

    this.addEventListener('shopify:block:select', (event) => {
      const trigger = event.target.querySelector?.('[data-joynure-category-trigger]');
      if (trigger) this.activate(Number(trigger.dataset.index));
    });

    this.activate(0, true);
  }

  disconnectedCallback() {
    this.clearTimers();
  }

  clearTimers() {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers = [];
  }

  schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      this.timers = this.timers.filter((activeTimer) => activeTimer !== timer);
      callback();
    }, delay);
    this.timers.push(timer);
  }

  activate(index, force = false) {
    if (!force && index === this.activeIndex) return;

    this.activeIndex = index;
    const trigger = this.triggers[index];
    if (!trigger || !this.image || !this.stage) return;

    this.triggers.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === index);
      item.setAttribute('aria-current', itemIndex === index ? 'true' : 'false');
    });

    const imageUrl = trigger.dataset.image;
    const caption = trigger.dataset.caption || '';
    const tagline = trigger.dataset.tagline || '';

    this.clearTimers();
    this.stage.classList.remove('is-assembling', 'is-assembled');
    this.image.classList.remove('is-ready');

    const reveal = () => {
      if (this.caption) this.caption.textContent = caption;
      if (this.tagline) this.tagline.textContent = tagline;

      if (this.reducedMotion.matches) {
        this.image.classList.add('is-ready');
        this.stage.classList.add('is-assembling', 'is-assembled');
        return;
      }

      // Start as separated tiles over the photo, then open into one image.
      this.image.classList.add('is-ready');

      const order = this.tiles
        .map((_, tileIndex) => tileIndex)
        .sort(() => Math.random() - 0.5);

      order.forEach((tileIndex, orderIndex) => {
        this.schedule(() => {
          this.tiles[tileIndex].style.transitionDelay = `${orderIndex * 45}ms`;
        }, 40);
      });

      this.schedule(() => {
        this.stage.classList.add('is-assembling');
      }, 80);

      this.schedule(() => {
        this.stage.classList.add('is-assembled');
        this.tiles.forEach((tile) => {
          tile.style.transitionDelay = '0ms';
        });
      }, 900);
    };

    if (this.image.getAttribute('src') === imageUrl) {
      reveal();
      return;
    }

    const nextImage = new Image();
    nextImage.decoding = 'async';
    nextImage.onload = () => {
      this.image.setAttribute('src', imageUrl);
      reveal();
    };
    nextImage.onerror = () => {
      this.image.setAttribute('src', imageUrl);
      reveal();
    };
    nextImage.src = imageUrl;
  }
}

if (!customElements.get('joynure-category-interactor')) {
  customElements.define('joynure-category-interactor', JoynureCategoryInteractor);
}
