import { LitElement, html } from 'lit';
import { getSheet } from './util';

const exampleBody = {
  dimensions: [
    { name: "sessionSource" },
  ],
  metrics: [
    { name: "activeUsers" },
    { name: "totalUsers" },
  ],
  dateRanges: [
    { startDate: "2020-03-31", endDate: "today" },
  ],
  dimensionFilter: {
    filter: {
      fieldName: "sessionSource",
      inListFilter: {
        values: [
          "facebook.com",
          "x.com",
          "twitter.com",
          "linkedin.com",
          "instagram.com",
          "pinterest.com",
          "youtube.com",
          "github.com",
          "reddit.com",
          "tumblr.com",
          "discord.com",
          "strava.com",
        ],
      },
    },
  },
};

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
    console.log(analytics);
    
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
    return `${name} - Sessions`;
  }

  getSocialIcon(name) {
    return `https://s.magecdn.com/social/tc-${name.replace('.com', '')}.svg`;
  }

  getDataPod(key) {
    const values = this.analytics[key];
    return html`
      <div class="sub-dimension">
        <div class="grid">
          <div class="cell grow">
            <img src="${this.getSocialIcon(key)}" alt="${key}" />${key}
          </div>
          ${values.map((obj) => {
            const val = Object.entries(obj)[0][1];
            const formatted = val % 1 !== 0 ? (Math.round(val * 100) / 100).toFixed(2) : val;
            return html`
              <div class="cell">
                ${formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            `;
          })}
        </div>
      </div>`;
  }

  getAnalytics() {
    if (!this.analytics) return html`<div class="loader"></div>`;
    return (
      html`
        <div class="head grid">
          <div class="cell grow">Referrer</div>
          <div class="cell">Active</div>
          <div class="cell">Total</div>
        </div>
        ${Object.keys(this.analytics).map((key) => (html`
          <div class="dimension">
              ${this.getDataPod(key)}
            </div>
          </div>`))}
      `);
  }
}

window.customElements.define('ga-pod', GaPod);
