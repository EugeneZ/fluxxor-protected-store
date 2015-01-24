# fluxxor-protected-store
Small utility to help generate stores in Fluxxor with support for enhancements like private methods.

Very quick and dirty. No idea if it breaks under certain conditions, works for me so far. You probably shouldn't use this.

Usage
------

    npm install fluxxor-protected-store

Then create your store just like you would with Fluxxor, with a couple changes. Here's an annotated example:

    var fluxxor = require('fluxxor'),
        protectedStore = require('fluxxor-protected-store');
    
    module.exports = fluxxor.createStore(protectedStore({
        
        // Only functions are allowed under the public key, and these are the only methods exposed by store
        // instance later. This forces you to write accessor methods for all of your data, which is a good
        // limitation. The context (this) of these methods is forced to the hidden 'private' store which allows
        // the methods to access the private members you create below.
        public: {
            isLoading: function () {
                return !!this.loading;
            },
            getErrors: function () {
                return this.errors;
            }
        },
        
        // Since the initialize function is treated as special by fluxxor (probably a good idea), this function
        // is also exposed to fluxxor if it is defined. This is a good place to initialize your private member
        // variables.
        initialize: function () {
            this.data = null;
            this.loading = false;
            this.errors = [];
        },
        
        // This API may need to change in the future and is probably the worst part of this library at the
        // moment. This function is the only place you can bind actions to the store, for better or for worse. It
        // is invoked once before initialization and an Object should be returned that determines what actions
        // will be bound to the store. The keys are the action names, and the values must be action handler
        // functions. I recommend using private functions as handlers.
        bindActions: function () {
            return {
                LOAD_DATA: this.loadData
            };
        },
        
        // This is an example of a private method. No one can access this method except other methods defined in
        // this spec.
        loadData: function(data) {
            this.data = data;
        }
    }));

Dependencies
-------------
There are none. It seems like fluxxor should be a dependency, but this lib will work just fine with any other library that creates stores like fluxxor does.
