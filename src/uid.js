'use strict'

/**
 * The cache variable
 * @type {Number}
 * @private
 */
let cache = 0
/**
 * The lastreset variable, since uid resets every milliseconds
 * @type {Date}
 * @private
 */
let lastReset = Date.now()

/**
 * Generates a random unique identifier
 * @return {String} A random unique identifier
 */
module.exports = () => {
  if ( lastReset !== Date.now() ) {
    cache = 0
    lastReset = Date.now()
  }
  cache++
  return Date.now() + '' + cache
}
