/* eslint-disable */

// This implementation of denodeify, taken from
// https://github.com/matthew-andrews/denodeify/blob/bbc334a90a4b036f491f766ce335fca7bd274109/index.js
// works in ways that Promise.denodeify does not (meteor-promise-docs shows [Object object]),
// Probably because the Object type returned doesn't pass the test of `instanceof Promise`
export const denodeify = function denodeify(nodeStyleFunction, filter) {
  return function () {
    const self = this;
    const functionArguments = new Array(arguments.length + 1);

    for (let i = 0; i < arguments.length; i += 1) {
      functionArguments[i] = arguments[i];
    }

    function promiseHandler(resolve, reject) {
      function callbackFunction() {
        let args = new Array(arguments.length);

        for (let i = 0; i < args.length; i += 1) {
          args[i] = arguments[i];
        }

        if (filter) {
          args = filter.apply(self, args);
        }

        const error = args[0];
        const result = args[1];

        if (error) {
          return reject(error);
        }

        return resolve(result);
      }

      functionArguments[functionArguments.length - 1] = callbackFunction;
      nodeStyleFunction.apply(self, functionArguments);
    }

    return new Promise(promiseHandler);
  };
};

// One does not simply denodeify Meteor.call
// export const callPromise = denodeify(Meteor.call.bind(Meteor));
