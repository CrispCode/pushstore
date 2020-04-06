# PushStore

A store library with push notification on changes.
Works as a mix of synchronous data storage and events.

It gives the user the ability to be notified on specific changes done to the stored data via listeners.

## Installation
```
    npm install @crispcode/pushstore
```

## How to use

#### A basic example would look like this:
```js
    import { store } from '@crispcode/pushstore'
    // You can also use:
    // const store = require( '@crispcode/pushstore' )

    store.set( 'key1', 'value1' )

    store.get( 'key1' ) // Will return 'value1'
    store.get() // Will return an object like: { key1: 'value1' }
```

#### Using a deep tree:
```js
    import { store } from '@crispcode/pushstore'
    // You can also use:
    // const store = require( '@crispcode/pushstore' )

    store.set( 'key1', 'value1' )
    store.set( 'key2.key21', 'value21' )
    store.set( 'key2.key22', 'value22' )

    store.get( 'key2.key21' ) // Will return 'value21'
    store.get() // Will return an object like: { key1: 'value1', key2: { key21: 'value21', key22: 'value22' } }
    store.get( 'key2' ) // Will return an object like: { key21: 'value21', key22: 'value22' }
```

#### Using a listener:
```js
    import { store } from '@crispcode/pushstore'
    // You can also use:
    // const store = require( '@crispcode/pushstore' )

    store.set( 'key1', 'value1' )
    store.set( 'key2.key21', 'value21' )
    store.set( 'key2.key22', 'value22' )
    let _unregister1 = store.on( 'key2.key21', ( value ) => {
        console.log( value ) // Will return 'new value'
    } )
    store.set( 'key2.key21', 'new value' )
    _unregister1() // This will unregister a listener

    // You can also get rid of concurency by using setting the immediate parameter to true when binding the listener
    store.set( 'foo', 'bar' )
    let _unregister2 = store.on( 'foo', ( value ) => {
        console.log( value ) // This will return 'bar' on first call, and 'bar2' on second call
    }, true ) // This will call the listener immediatly upon binding with the current value
    store.set( 'foo', 'bar2' )
    _unregister2() // This will unregister a listener

    // When a property changes, all its children and parent listeners will be triggered
    let _unregister1 = store.on( 'key1', ( value ) => {
        console.log( value ) // Will return 'new value'
    } )
    let _unregister2 = store.on( 'key1.key11', ( value ) => {
        console.log( value ) // Will return 'new value'
    } )
    let _unregister3 = store.on( 'key1.key11.key111', ( value ) => {
        console.log( value ) // Will return 'new value'
    } )

    store.set('key1.key11', 'foo' )

    _unregister1() // This will unregister a listener
    _unregister2() // This will unregister a listener
    _unregister3() // This will unregister a listener
```

#### Details & Caveats:

 - Be careful when working with references instead of values. If an object is stored, and one of its subproperties is changed by other means then store.set(), the listeners will not be triggered. To make sure they are triggered, set the object again in pushstore.
 - However if you have a handler on a subproperty, and its parent object is changed via pushstore.set() the subproperty handler will be called with the new subvalue
 - Pushstore instance is global in the curent context, out of the box. But you can create a new instance private of pushstore with default values by calling ```js pushstore.create( defaults ) ```. If no argument is specified the new instance will be empty
 - Always remember to unsubscribe your listeners when they are not needed anymore. When a listener is bound, a function is returned by pushstate.on(). Calling this function will unregister the listener.
 - You can have multiple listeners bound to one property.