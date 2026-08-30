/**
 * Before/After comparison slider + review card carousel.
 */

class JoynureReveal extends HTMLElement {
  connectedCallback() {
    this.container = this.querySelector('[data-joynure-reveal-frame]');
    this.beforeLayer = this.querySelector('[data-joynure-reveal-before]');
    this.divider = this.querySelector('[data-joynure-reveal-divider]');
    this.orientation = this.dataset.orientation || 'horizontal';
    this.position = Number(this.dataset.initialPosition || 50);
    this.dragging = false;

    if (!this.container || !this.beforeLayer || !this.divider) return;

    this.applyPosition(this.position);

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.container.addEventListener('pointerdown', this.onPointerDown);
    this.container.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback() {
    this.container?.removeEventListener('pointerdown', this.onPointerDown);
    this.container?.removeEventListener('keydown', this.onKeyDown);
    this.stopDragging();
  }

  onPointerDown(event) {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
    this.container.setPointerCapture?.(event.pointerId);
    this.moveFromEvent(event);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  onPointerMove(event) {
    if (!this.dragging) return;
    this.moveFromEvent(event);
  }

  onPointerUp() {
    this.stopDragging();
  }

  stopDragging() {
    this.dragging = false;
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }

  onKeyDown(event) {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.applyPosition(this.position - step);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.applyPosition(this.position + step);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.applyPosition(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.applyPosition(100);
    }
  }

  moveFromEvent(event) {
    const rect = this.container.getBoundingClientRect();
    let next;
    if (this.orientation === 'vertical') {
      next = ((event.clientY - rect.top) / rect.height) * 100;
    } else {
      next = ((event.clientX - rect.left) / rect.width) * 100;
    }
    this.applyPosition(next);
  }

  applyPosition(value) {
    this.position = Math.max(0, Math.min(100, value));
    const remaining = 100 - this.position;

    if (this.orientation === 'vertical') {
      this.beforeLayer.style.clipPath = `inset(0 0 ${remaining}% 0)`;
      this.divider.style.top = `${this.position}%`;
      this.divider.style.left = '0';
    } else {
      this.beforeLayer.style.clipPath = `inset(0 ${remaining}% 0 0)`;
      this.divider.style.left = `${this.position}%`;
      this.divider.style.top = '0';
    }

    this.container.setAttribute('aria-valuenow', String(Math.round(this.position)));
  }
}

class JoynureRevealCarousel extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-joynure-reveal-track]');
    this.prevBtn = this.querySelector('[data-joynure-reveal-prev]');
    this.nextBtn = this.querySelector('[data-joynure-reveal-next]');
    if (!this.track) return;

    this.onPrev = () => this.scrollByCards(-1);
    this.onNext = () => this.scrollByCards(1);
    this.onScroll = () => this.updateNav();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = () => this.updateNav();

    this.prevBtn?.addEventListener('click', this.onPrev);
    this.nextBtn?.addEventListener('click', this.onNext);
    this.track.addEventListener('scroll', this.onScroll, { passive: true });
    this.track.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);

    this.updateNav();
  }

  disconnectedCallback() {
    this.prevBtn?.removeEventListener('click', this.onPrev);
    this.nextBtn?.removeEventListener('click', this.onNext);
    this.track?.removeEventListener('scroll', this.onScroll);
    this.track?.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
  }

  cardStep() {
    const card = this.track.querySelector('.joynure-reveal-card');
    if (!card) return this.track.clientWidth * 0.8;
    const styles = getComputedStyle(this.track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
  }

  scrollByCards(direction) {
    this.track.scrollBy({ left: direction * this.cardStep(), behavior: 'smooth' });
  }

  onKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scrollByCards(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.scrollByCards(1);
    }
  }

  updateNav() {
    if (!this.prevBtn || !this.nextBtn) return;
    const max = this.track.scrollWidth - this.track.clientWidth - 2;
    const left = this.track.scrollLeft;
    this.prevBtn.disabled = left <= 2;
    this.nextBtn.disabled = left >= max;
  }
}

if (!customElements.get('joynure-reveal')) {
  customElements.define('joynure-reveal', JoynureReveal);
}

if (!customElements.get('joynure-reveal-carousel')) {
  customElements.define('joynure-reveal-carousel', JoynureRevealCarousel);
}
