'use strict'

const isObject = require( './isobject.js' )

/**
 * Used to return a deep value from an Object. Without any checks.
 */
let getValueFromObject = ( keys, collection ) => {
  let key = keys.shift()

  if ( keys.length === 0 ) {
    return collection[ key ]
  } else {
    if ( isObject( collection[ key ] ) ) {
      return getValueFromObject( keys, collection[ key ] )
    }
  }
}

/**
 * Used to return a deep value from an Object. Use the "." separator to check subobjects
 * @param {String} key The key to check the value for
 * @param {Object} collection The collection to be checked
 * @param {String} splitter The character to be treated as a splitter
 * @return {String} Returns the value for the key in the collection
 */
module.exports = ( key, collection, splitter = '.' ) => {
  if ( typeof key === 'string' && isObject( collection ) ) {
    if ( key === '' ) {
      return collection
    }
    return getValueFromObject( key.split( splitter ), collection )
  }
}
