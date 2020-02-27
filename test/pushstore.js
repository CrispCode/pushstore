/* globals describe, it */

const pushstore = require( './../src/store.js' )
const assert = require( 'assert' )

describe( 'PushStore', () => {
  describe( '# PushStore.create()', () => {
    it( 'should create a new instance of PushStore', () => {
      let instance = pushstore.create()
      assert.ok( instance.constructor.name === 'Store' )
    } )

    it( 'should create a new instance of PushStore with different data then the singleton', () => {
      pushstore.set( 'test', 'value1' )
      let instance = pushstore.create()
      instance.set( 'test', 'value2' )
      assert.ok( instance.get( 'test' ) !== pushstore.get( 'test' ) )
      pushstore.set( 'test', undefined )
    } )

    it( 'should allow accept an object as it\'s initial data', () => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      assert.ok( instance.get( 'name1' ) === data.name1 && instance.get( 'name2.name21' ) === data.name2.name21 )
    } )
  } )

  describe( '# PushStore.get()', () => {
    it( 'should get the value of a data stored based on it\'s name', () => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      assert.ok( instance.get( 'name1' ) === data.name1 )
    } )

    it( 'should get the value of a data stored as a subproperty, based on it\'s name, using the "." splitter', () => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      assert.ok( instance.get( 'name2.name21' ) === data.name2.name21 )
    } )

    it( 'should get the entire data if no key is specified', () => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      let parent = instance.get()
      assert.ok( parent.name2.name21 === 'value 21' )
    } )
  } )

  describe( '# PushStore.set()', () => {
    it( 'should set the value of a property based on a key', () => {
      let instance = pushstore.create()
      instance.set( 'name1', 'value 1' )
      assert.ok( instance.get( 'name1' ) === 'value 1' )
    } )

    it( 'should set the value of a sub property based on a key and using splitters', () => {
      let instance = pushstore.create()
      instance.set( 'name1.name2.name3', 'value 123' )
      assert.ok( instance.get( 'name1.name2.name3' ) === 'value 123' )
    } )

    it( 'should set the value of a sub property based on a key and using splitters, and be able to retrieve part way', () => {
      let instance = pushstore.create()
      instance.set( 'name1.name2.name3', 'value 123' )
      let parent = instance.get( 'name1.name2' )
      assert.ok( parent.name3 === 'value 123' )
    } )
  } )

  describe( '# PushStore.on()', () => {
    it( 'should bind change notification handlers on specific properties', ( next ) => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      instance.on( 'name3', ( value ) => {
        assert.ok( value === 'value 3' && instance.get( 'name3' ) === 'value 3' )
        next()
      } )
      instance.set( 'name3', 'value 3' )
    } )

    it( 'should return the existing value on bind if immediate is set to true', ( next ) => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      instance.on( 'name2.name21', ( value ) => {
        assert.ok( value === 'value 21' && instance.get( 'name2.name21' ) === 'value 21' )
        next()
      }, true )
    } )

    it( 'should return the existing value on bind if immediate is set to true, and continue to listen for changes', ( next ) => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      let calls = 0
      instance.on( 'name2.name21', ( value ) => {
        calls++
        if ( calls === 2 ) {
          assert.ok( value === 'new' && instance.get( 'name2.name21' ) === 'new' )
          next()
        }
      }, true )
      instance.set( 'name2.name21', 'new' )
    } )

    it( 'should remove the listener if the returned function is called', ( next ) => {
      let instance = pushstore.create()
      instance.set( 'name', 'value1' )
      let calls = 0
      let kill = instance.on( 'name', () => {
        calls++
        if ( calls === 2 ) {
          assert.ok( false )
          next()
        }
      } )
      instance.set( 'name', 'value2' )
      kill()
      instance.set( 'name', 'value3' )
      let removed = true
      for ( let i = 0; i < instance.__listeners.length; i++ ) {
        if ( instance.__listeners[ i ].key === 'name' ) {
          removed = false
          break
        }
      }
      assert.ok( removed )
      next()
    } )

    it( 'should remain active even if the property no longer exists', ( next ) => {
      let instance = pushstore.create()
      instance.set( 'name', 'value1' )
      let calls = 0
      instance.on( 'name', ( value ) => {
        calls++
        if ( calls === 2 ) {
          assert.ok( value === 'new' )
          next()
        }
      } )
      instance.set( 'name' )
      instance.set( 'name', 'new' )
    } )

    it( 'should have a handler called even if the changed value was it\'s parent', ( next ) => {
      let data = {
        name1: 'value 1',
        name2: {
          name21: 'value 21'
        }
      }
      let instance = pushstore.create( data )
      let calls = 0
      instance.on( 'name2.name21', ( value ) => {
        calls++
        if ( calls === 2 ) {
          assert.ok( value === 'new' )
          next()
        }
      } )
      instance.set( 'name2', null )
      instance.set( 'name2', { name21: 'new' } )
    } )

    it( 'should call the handler if imediate is set even if the value is not defined', ( next ) => {
      let instance = pushstore.create()
      let calls = 0
      let correct = true
      instance.on( 'name', ( value ) => {
        calls++
        switch ( calls ) {
          case 1:
            if ( value !== undefined ) {
              correct = false
            }
            break
          case 2:
            if ( value !== undefined ) {
              correct = false
            }
            break
          case 3:
            if ( value !== 'last' ) {
              correct = false
            }
            assert.ok( correct )
            next()
            break
        }
      }, true )
      instance.set( 'name' )
      instance.set( 'name', 'last' )
    } )

    it( 'should be able to bind more than one listener to the same properyy', ( next ) => {
      let data = {
        name: 'value'
      }
      let instance = pushstore.create( data )
      let handler1called = 0
      let handler1correct = true
      instance.on( 'name', ( value ) => {
        handler1called++
        switch ( handler1called ) {
          case 1:
            if ( value !== 'value' ) {
              handler1correct = false
            }
            break
          case 2:
            if ( value !== 'new value' ) {
              handler1correct = false
            }
            break
        }
      }, true )

      let handler2called = 0
      let handler2correct = true
      instance.on( 'name', ( value ) => {
        handler2called++
        switch ( handler2called ) {
          case 1:
            if ( value !== 'new value' ) {
              handler2correct = false
            }
            break
        }
      } )

      instance.set( 'name', 'new value' )
      setTimeout( () => {
        assert.ok( handler1correct && handler2correct )
        next()
      }, 100 )
    } )
  } )
} )
