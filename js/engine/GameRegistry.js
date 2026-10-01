/**
 * NEUROSYNAPSE - Central Game Registry
 * Single source of truth for all game metadata, categories, and class references.
 * Adding a new game = 1 file + 1 GameRegistry.register() call. Zero HTML changes.
 */

class GameRegistry {
  static _games = {};
  static _categories = {};
  static _categoryOrder = [];

  /**
   * Register a game with its full metadata.
   * @param {string} key - Unique game identifier (e.g., 'chromashift')
   * @param {Object} config - Game metadata and class reference
   */
  static register(key, config) {
    this._games[key] = { key, ...config };

    // Auto-track unique categories in registration order
    if (config.category && !this._categories[config.category]) {
      this._categories[config.category] = {
        id: config.category,
        name: config.categoryName || config.category,
        catClass: config.catClass || '',
        icon: config.categoryIcon || '🧪'
      };
      this._categoryOrder.push(config.category);
    }
  }

  /**
   * Get a game's metadata by key.
   * @param {string} key
   * @returns {Object|null}
   */
  static get(key) {
    return this._games[key] || null;
  }

  /**
   * Get all registered games as an object.
   * @returns {Object}
   */
  static getAll() {
    return { ...this._games };
  }

  /**
   * Get all game keys as an array.
   * @returns {string[]}
   */
  static getAllKeys() {
    return Object.keys(this._games);
  }

  /**
   * Get games filtered by category.
   * @param {string} category
   * @returns {Object}
   */
  static getByCategory(category) {
    const result = {};
    Object.entries(this._games).forEach(([k, v]) => {
      if (v.category === category) result[k] = v;
    });
    return result;
  }

  /**
   * Get all unique categories with metadata.
   * @returns {Object}
   */
  static getCategories() {
    return { ...this._categories };
  }

  /**
   * Get category keys in registration order.
   * @returns {string[]}
   */
  static getCategoryOrder() {
    return [...this._categoryOrder];
  }

  /**
   * Get total number of registered games.
   * @returns {number}
   */
  static count() {
    return Object.keys(this._games).length;
  }

  /**
   * Instantiate a game by key.
   * @param {string} key - Game identifier
   * @param {Object} engine - The NeuroSynapseApp engine reference
   * @returns {BaseGame|null}
   */
  static create(key, engine) {
    const config = this._games[key];
    if (!config || !config.GameClass) {
      console.error(`[GameRegistry] Game "${key}" not found or has no GameClass.`);
      return null;
    }
    return new config.GameClass(engine);
  }

  /**
   * Generate dashboard featured game card HTML for a game.
   * @param {string} key
   * @returns {string} HTML string
   */
  static renderFeaturedCard(key) {
    const g = this._games[key];
    if (!g) return '';
    return `
      <div class="game-card glass-panel" data-game="${key}">
        <div class="game-badge ${g.tagClass}">${g.categoryLabel}</div>
        <div class="game-icon-orb ${g.orbClass}">
          <span>${g.icon}</span>
        </div>
        <h4>${g.name} (${g.subtitle})</h4>
        <p>${g.description}</p>
        <div class="game-card-footer">
          <span class="tier-label">Zorluk: ${g.difficultyLabel}</span>
          <button class="btn-play-card" onclick="app.launchGame('${key}')">Oyna</button>
        </div>
      </div>
    `;
  }

  /**
   * Generate games hub detail card HTML for a game.
   * @param {string} key
   * @returns {string} HTML string
   */
  static renderHubCard(key) {
    const g = this._games[key];
    if (!g) return '';
    const skillsHtml = (g.skills || []).map(s => `<span>${s}</span>`).join('');
    return `
      <div class="hub-game-card glass-panel" data-category="${g.category}">
        <div class="hub-card-top">
          <span class="category-badge ${g.catClass}">${g.categoryName}</span>
          <span class="plays-count">${g.tagline}</span>
        </div>
        <div class="hub-card-main">
          <div class="hub-icon-wrap ${g.orbClass}">${g.icon}</div>
          <h3>${g.name}: ${g.subtitle}</h3>
          <p>${g.fullDescription}</p>
          <div class="skills-targeted">
            ${skillsHtml}
          </div>
        </div>
        <div class="hub-card-bottom">
          <button class="btn-primary w-full" onclick="app.launchGame('${key}')">Simülasyonu Başlat</button>
        </div>
      </div>
    `;
  }

  /**
   * Generate filter pill buttons HTML.
   * @returns {string} HTML string
   */
  static renderFilterPills() {
    let html = `<button class="pill active" data-filter="all">Tümü (${this.count()})</button>`;
    this._categoryOrder.forEach(catId => {
      const cat = this._categories[catId];
      const count = Object.keys(this.getByCategory(catId)).length;
      html += `<button class="pill" data-filter="${catId}">${cat.name} (${count})</button>`;
    });
    return html;
  }
}

window.GameRegistry = GameRegistry;
