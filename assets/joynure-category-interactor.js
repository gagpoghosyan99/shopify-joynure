class JoynureCategoryInteractor extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;
    this.activeIndex = 0;
    this.triggers = Array.from(this.querySelectorAll('[data-joynure-category-trigger]'));
    this.image = this.querySelector('[data-joynure-category-image]');
    this.imageGroup = this.querySelector('[data-joynure-category-image-group]');
    this.timers = [];
    this.animations = [];
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
    this.stopLoop();
  }

  activate(index, force = false) {
    if (!force && index === this.activeIndex) return;

    this.activeIndex = index;
    const trigger = this.triggers[index];
    if (!trigger || !this.image || !this.imageGroup) return;

    this.triggers.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === index);
      item.setAttribute('aria-current', itemIndex === index ? 'true' : 'false');
    });

    const imageUrl = trigger.dataset.image;
    const clipId = trigger.dataset.clip;
    this.image.setAttribute('href', imageUrl);
    this.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageUrl);
    this.imageGroup.setAttribute('clip-path', `url(#${clipId})`);
    this.startLoop(index);
  }

  stopLoop() {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.animations.forEach((animation) => animation.cancel());
    this.timers = [];
    this.animations = [];
  }

  schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      this.timers = this.timers.filter((activeTimer) => activeTimer !== timer);
      callback();
    }, delay);
    this.timers.push(timer);
  }

  animatePath(path, keyframes, options) {
    const animation = path.animate(keyframes, { fill: 'forwards', ...options });
    this.animations.push(animation);
    animation.addEventListener('finish', () => {
      path.style.transform = keyframes[keyframes.length - 1].transform;
      animation.cancel();
      this.animations = this.animations.filter((activeAnimation) => activeAnimation !== animation);
    }, { once: true });
  }

  startLoop(index) {
    this.stopLoop();
    const clip = this.querySelector(`[data-clip-index="${index}"]`);
    if (!clip) return;

    const paths = Array.from(clip.querySelectorAll('.path'));
    paths.forEach((path) => {
      path.style.transform = 'scale(0)';
    });

    if (this.reducedMotion.matches) {
      paths.forEach((path) => {
        path.style.transform = 'scale(1)';
      });
      return;
    }

    const runCycle = () => {
      const randomOrder = paths.map((_, pathIndex) => pathIndex).sort(() => Math.random() - 0.5);
      randomOrder.forEach((pathIndex, orderIndex) => {
        this.schedule(() => {
          this.animatePath(paths[pathIndex], [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
            duration: 800,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
          });
        }, orderIndex * (400 / Math.max(paths.length - 1, 1)));
      });

      paths.forEach((path, pathIndex) => {
        this.schedule(() => {
          this.animatePath(path, [
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
          ], { duration: 3000, easing: 'ease-in-out' });
        }, 1050 + pathIndex * (200 / Math.max(paths.length - 1, 1)));
      });

      const edgeOrder = paths
        .map((_, pathIndex) => pathIndex)
        .sort((a, b) => Math.abs(b - (paths.length - 1) / 2) - Math.abs(a - (paths.length - 1) / 2));

      edgeOrder.forEach((pathIndex, orderIndex) => {
        this.schedule(() => {
          this.animatePath(paths[pathIndex], [{ transform: 'scale(1)' }, { transform: 'scale(0)' }], {
            duration: 600,
            easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
          });
        }, 4300 + orderIndex * (300 / Math.max(paths.length - 1, 1)));
      });

      this.schedule(runCycle, 6200);
    };

    runCycle();
  }
}

if (!customElements.get('joynure-category-interactor')) {
  customElements.define('joynure-category-interactor', JoynureCategoryInteractor);
}
