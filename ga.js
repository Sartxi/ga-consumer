import { LitElement, html } from 'lit';
import { getSheet } from './util';

const exampleBody = {
  dateRanges: [
      { startDate: "2020-03-31", endDate: "today" }
  ],
  dimensions: [
      { name: "country" }
  ],
  metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "bounceRate" }
  ]
}

async function getAnalytics() {
  try {
    const job = await fetch('http://localhost:2000/analytics', { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: JSON.stringify(exampleBody) });
    if (!job.ok) console.log(job);
    const result = await job.json();
    return { result };
  } catch (error) {
    return { message: error.message };
  }
}

/**
 * The Google Analytics Pod
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class GaPod extends LitElement {
  static get properties() {
    return {
      name: {type: String},
      analytics: {type: Object}
    };
  }

  constructor() {
    super();
    this.name = 'Google Analytics';
  }

  async connectedCallback() {
    super.connectedCallback();
    const styleSheet = await getSheet('/styles/ga.css');
    this.renderRoot.adoptedStyleSheets = [styleSheet];
    const analytics = await getAnalytics();
    this.analytics = analytics.result;
  }

  render() {
    return html`
      <div class="ga-pod">
        <h2>${this.getPod(this.name)}</h2>
        <div class="dimensions">${this.getAnalytics()}</div>
      </div>
    `;
  }

  getPod(name) {
    return `${name} Data`;
  }

  getDataPod(key) {
    const values = this.analytics[key][0][key];
    return html`
      <div class="sub-dimension">
        <strong>${key}</strong>
        <div class="values">
          ${values.map((obj) => {
            const [key, val] = Object.entries(obj)[0];
            const formatted = val % 1 !== 0 ? (Math.round(val * 100) / 100).toFixed(2) : val;
            return html`
              <div class="value">
                <span>${key}</span>
                <strong>
                  ${formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </strong>
              </div>`;
          })}
        </div>
      </div>`;
  }

  getAnalytics() {
    if (!this.analytics) return html`<div class="loader"></div>`;
    return Object.keys(this.analytics).map((key) => (html`<div class="dimension">${this.getDataPod(key)}</div>`));
  }
}

window.customElements.define('ga-pod', GaPod);
