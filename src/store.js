'use strict'

const getter = require( './getter.js' )
const setter = require( './setter.js' )
const loop = require( './loop.js' )
const uid = require( './uid.js' )

const splitter = '.'

/**
 * Class holding the store data and listeners
 */
class Store {
  /**
   * Creates an instance of Store
   * @param {Object} defaults The default store values for the current instance
   */
  constructor ( defaults ) {
    /**
     * Contains all the data
     * @type {Object}
     * @private
     */
    this.__data = defaults || {}

    /**
     * Contains all the listeners subscribed to the Store
     * @type {Object}
     * @private
     */
    this.__listeners = {}
  }

  /**
   * Method used to bind handlers to the Store
   * NOTE: If the store does value is undefined it will not call the handler even if immediate is set to TRUE. This occurs on bind only, and it will trigger regardless of the change when using set.
   * @param {String} key You can use sub data by concatenating strings with '.', eg: employee.name.firstname
   * @param {Function} listener The handler for the change notification
   * @param {Boolen} [immediate=false] Set to true if data is to be sent to the handler upon attachment, if set to false it will work as an event handler
   * @return {Function} Call this function to unsubscribe a handler
   */
  on ( key, listener, immediate ) {
    let id = uid()
    this.__listeners[ id ] = {
      key: key,
      handler: listener
    }
    if ( immediate ) {
      listener( this.get( key ) )
    }
    return () => {
      delete this.__listeners[ id ]
    }
  }

  /**
   * Sets data in store and calls bound listeners
   * @param {String} key You can use sub data by concatenating strings with '.', eg: employee.name.firstname
   * @param {*} value The value of the property
   * @return { this }
   */
  set ( key, value ) {
    setter( key, value, this.__data, splitter )

    loop( this.__listeners, ( data ) => {
      if ( data.key === key ) {
        data.handler( value )
      } else {
        // Check sub properties in case the value added was an object
        let suffix = data.key.substring( key.length )
        if ( suffix.substring( 0, 1 ) === splitter ) {
          data.handler( this.get( data.key ) )
        }
      }
    } )

    return this
  }

  /**
   * Gets data from store
   * @param {*} key You can use sub data by concatenating strings with '.', eg: employee.name.firstname
   */
  get ( key ) {
    return getter( key || '', this.__data, splitter )
  }

  /**
   * Returns an instance of Store
   * @param {Object} defaults The default data for the current instance
   * @return { Store }
   */
  create ( defaults ) {
    return new Store( defaults )
  }
}

/**
 * Instance of Store to be used as singleton
 */
const store = new Store()
module.exports = store
