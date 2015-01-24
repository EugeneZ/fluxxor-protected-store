var hostFn = function(host, fn) {
    return function() {
        host.flux = this.flux;
        host.waitFor = this.waitFor.bind(this);
        host.emit = this.emit.bind(this);
        return fn.apply(host, arguments);
    };
};

var bindActionsFn = function(host, spec, args) {
    if ('bindActions' in spec){
        var actionMap = spec.bindActions.apply(host, args);
        for (var action in actionMap) {
            this.bindActions(action, hostFn(host, actionMap[action]));
        }
    }
};

/**
 * Pass your store spec to this function, and pass the result to fluxxor.createStore(). The functionality is similar, with the following differences:
 *  1) There is only one way of binding actions: When the store is initialized, the return value of the function assigned to the bindActions
 *     key will be assumed to be an object of keys indicating actions, and the values the methods to be bound to them.
 *  2) A special 'public' key determines what functions to expose on the store. Nothing else is exposed.
 *  3) All other members are private to the store. The public methods can access these members via 'this' but they will be otherwise inaccessible.
 * @param spec
 * @returns {*}
 */
module.exports = function(spec){
    var fluxxorSpec = {};

    // Forbid use of illegal keys
    ['flux', 'waitFor'].forEach(function(key) {
        if (spec[key]) {
            throw new Error("Reserved key '" + key + "' found in store definition");
        }
    });

    // create host object
    var host = new function(){
        for (var prop in spec){
            if (prop !== 'public' && prop !== 'initialize' && prop !== 'bindActions') {
                this[prop] = spec[prop];
            } else if (prop === 'public') {
                for (var publicProp in spec[prop]) {
                    this[publicProp] = spec[prop][publicProp];
                }
            }
        }
    };

    fluxxorSpec.initialize = function(){
        bindActionsFn.call(this, host, spec, arguments);
        spec.initialize && spec.initialize.apply(host, arguments);
    };

    if ('public' in spec){
        for (var publicProp in spec.public) {
            var prop = spec.public[publicProp];
            if (typeof prop === 'function') {
                fluxxorSpec[publicProp] = hostFn(host, prop);
            } else {
                throw new Error('Non-function public members are not supported. Create getter/setter.');
            }
        }
    }

    return fluxxorSpec;
};
