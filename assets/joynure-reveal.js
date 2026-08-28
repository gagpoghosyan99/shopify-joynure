/**
 * Before/After comparison slider (Liquid port of Reveal1).
 * Pointer + keyboard accessible.
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

if (!customElements.get('joynure-reveal')) {
  customElements.define('joynure-reveal', JoynureReveal);
}
