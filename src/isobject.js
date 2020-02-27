'use strict'

/**
 * Checks if the object is an Object
 * @param {mixed} o The value to be checked if its an Object
 * @return {Boolean} Returns true if the value is an Object
 */
module.exports = o => !Array.isArray( o ) && o !== null && typeof o === 'object' && Object.prototype.toString.call( o ) === '[object Object]'
