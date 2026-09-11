/**
 * Baby Care collection: horizontal carousel for changing-mat color cards.
 * Visible card count is CSS-driven (--joynure-baby-mat-visible):
 *   mobile ~1.15, tablet ~2.5, desktop 4.
 */

class JoynureBabyMatCarousel extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-joynure-baby-mat-track]');
    this.prevBtn = this.querySelector('[data-joynure-baby-mat-prev]');
    this.nextBtn = this.querySelector('[data-joynure-baby-mat-next]');
    if (!this.track) return;

    this.onPrev = () => this.scrollByCards(-1);
    this.onNext = () => this.scrollByCards(1);
    this.onScroll = () => this.updateNav();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = () => {
      this.updateNav();
    };

    this.prevBtn?.addEventListener('click', this.onPrev);
    this.nextBtn?.addEventListener('click', this.onNext);
    this.track.addEventListener('scroll', this.onScroll, { passive: true });
    this.track.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize, { passive: true });

    // Recalc after images/layout settle so disabled states are accurate.
    requestAnimationFrame(() => this.updateNav());
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
    const slide = this.track.querySelector('.joynure-baby-mat-carousel__slide');
    if (!slide) return Math.max(this.track.clientWidth * 0.8, 120);
    const styles = getComputedStyle(this.track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return slide.getBoundingClientRect().width + gap;
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
    this.nextBtn.disabled = left >= max || max <= 0;
  }
}

if (!customElements.get('joynure-baby-mat-carousel')) {
  customElements.define('joynure-baby-mat-carousel', JoynureBabyMatCarousel);
}
