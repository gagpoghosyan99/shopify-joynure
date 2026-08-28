/**
 * Accessible tab panels for JOYNURE Hula PDP.
 */
class JoynurePdpTabs extends HTMLElement {
  connectedCallback() {
    this.triggers = Array.from(this.querySelectorAll('.joynure-pdp-tabs__trigger'));
    this.panels = Array.from(this.querySelectorAll('.joynure-pdp-tabs__panel'));

    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => this.activate(trigger.dataset.tab));
    });
  }

  activate(tabName) {
    this.triggers.forEach((trigger) => {
      const isActive = trigger.dataset.tab === tabName;
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    this.panels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabName;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }
}

if (!customElements.get('joynure-pdp-tabs')) {
  customElements.define('joynure-pdp-tabs', JoynurePdpTabs);
}
