/**
 * NEUROSYNAPSE - Adaptive Difficulty Manager
 * Provides a standardized difficulty curve across all games.
 * Level increases on correct streaks, decreases on error streaks.
 */

class DifficultyManager {
  constructor(initialLevel = 1) {
    this.level = initialLevel;
    this.minLevel = 1;
    this.maxLevel = 10;
    this.correctStreak = 0;
    this.errorStreak = 0;
    this.totalCorrect = 0;
    this.totalErrors = 0;
  }

  /** Call after a correct answer */
  onCorrect() {
    this.totalCorrect++;
    this.correctStreak++;
    this.errorStreak = 0;

    // Increase difficulty after 3 consecutive correct answers
    if (this.correctStreak >= 3) {
      this.level = Math.min(this.maxLevel, this.level + 0.5);
      this.correctStreak = 0;
    }
  }

  /** Call after an incorrect answer */
  onError() {
    this.totalErrors++;
    this.errorStreak++;
    this.correctStreak = 0;

    // Decrease difficulty after 2 consecutive errors
    if (this.errorStreak >= 2) {
      this.level = Math.max(this.minLevel, this.level - 0.5);
      this.errorStreak = 0;
    }
  }

  /** Returns integer level (1-10) */
  getLevel() {
    return Math.floor(this.level);
  }

  /** Returns float level for fine-grained control */
  getRawLevel() {
    return this.level;
  }

  /**
   * Calculate a dynamic time limit based on difficulty.
   * As difficulty rises, the allowed time decreases.
   * @param {number} baseMs - Time limit at level 1 (easiest)
   * @param {number} minMs  - Minimum time limit at max difficulty
   * @returns {number} Time in milliseconds
   */
  getTimeLimit(baseMs, minMs) {
    const ratio = (this.level - this.minLevel) / (this.maxLevel - this.minLevel);
    return Math.round(Math.max(minMs, baseMs - (baseMs - minMs) * ratio));
  }

  /**
   * Returns a speed multiplier (1.0 at level 1, up to 1.9 at level 10)
   * Useful for animation speeds, spawn rates, etc.
   */
  getSpeedMultiplier() {
    return 1 + (this.level - 1) * 0.1;
  }

  /**
   * Returns a 0-1 ratio representing current difficulty progression
   */
  getRatio() {
    return (this.level - this.minLevel) / (this.maxLevel - this.minLevel);
  }

  /**
   * Returns a value interpolated between min and max based on difficulty
   * @param {number} atMin - Value at minimum difficulty
   * @param {number} atMax - Value at maximum difficulty
   */
  lerp(atMin, atMax) {
    return atMin + (atMax - atMin) * this.getRatio();
  }

  /** Reset to initial state */
  reset(initialLevel = 1) {
    this.level = initialLevel;
    this.correctStreak = 0;
    this.errorStreak = 0;
    this.totalCorrect = 0;
    this.totalErrors = 0;
  }

  /** Get accuracy percentage */
  getAccuracy() {
    const total = this.totalCorrect + this.totalErrors;
    return total > 0 ? Math.round((this.totalCorrect / total) * 100) : 100;
  }
}

window.DifficultyManager = DifficultyManager;
