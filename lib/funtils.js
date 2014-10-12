/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */

'use strict';

/**
 * naive clone function for copying simple object/array/primitive data
 *
 * @param {object|array} obj_or_array Object or Array to deep clone
 */
function clone(obj_or_array) {
   var prop, cloneObj = {}, cloneArr = [];

   if (obj_or_array instanceof Array) {
		obj_or_array.forEach(function (elem) {
			cloneArr.push(clone(elem));
		});

		return cloneArr;
   } else if (obj_or_array instanceof Function) {
		return obj_or_array;
   } else if (obj_or_array instanceof Object) {
      for (prop in obj_or_array) {
         if (obj_or_array.hasOwnProperty(prop)) {
            cloneObj[prop] = clone(obj_or_array[prop]);
         }
      }

      return cloneObj;
   }

   return obj_or_array;
}

/**
 * functional method to slice array or arguments
 */
var slice = Function.call.bind([].slice);

/**
 * functional method to splice array or arguments
 */
var splice = Function.call.bind([].splice);

/**
 * functional method to reduce array or arguments
 */
var reduce = Function.call.bind(Array);

/**
 * tell if something exists (ie it's neither null, nor undefined)
 */
function existy(test) {
   /* jshint eqnull: true */
   return test != null;
}

/**
 * functional dispatcher
 *
 * @param {...function} fn - function to call for dispatching
 *
 * @return {function}
 */
function dispatch(/* fns */) {
   var fns = slice(arguments),
       size = fns.length;

   return function do_dispatch(target /* args */) {
      var args = slice(arguments, 1),
          ret,
          fn,
          i;

      for (i = 0; i < size; ++i) {
         fn = fns[i];

         ret = fn.apply(null, [target].concat(args));

         if (existy(ret)) return ret;
      }

      return ret;
   };
}

/**
 * identity
 *
 * @param {Mixed} me - what should always be returned
 *
 * @returns {Mixed}
 */
function identity(me) {
   return function _identity() { return me; };
}

/**
 * curry given function
 *
 * @param {function} fun - function to curry
 *
 * @returns {function}
 */
function curry(fun) {
   return function _curry(arg) {
      return fun(arg);
   };
}

/**
 * partial function generator
 *
 * @param {function} fun - function to wrap
 * @param {[Mixed]} pargs - arguments to be prepended to arguments
 *
 * @returns {function}
 */
function partial(fun /* pargs */) {
   var pargs = slice(arguments, 1);

   return function _partial(/* args */) {
      return fun.apply(null, pargs.concat(slice(arguments)));
   };
}

/**
 * compose compose(f, g) => f(g(x))
 *
 * @param {function}
 * @param {function}
 *
 * @returns {function}
 */
function compose(f, g) {
   return function _composee(x) {
      return f(g(x));
   };
}

/**
 * sorts numerically
 */
function sortNumeric(a, b) {
   a = +a;
   b = +b;
   return a > b ? 1 : a < b ? -1 : 0;
}

/**
 * gets the values for a given object
 *
 * @param {Object}
 *
 * @return {Array}
 */
function values(obj) {
	return Object.keys(obj).map(function (key) { return obj[key]; });
}

/**
 * memoize the given function so it is called once and it's return value is
 * used for all subsequent calls
 *
 * @param {Function}
 */
function memoize(fn) {
   var memo,
       called = false;

   return function() {
      if (called) return memo;

      memo = fn.apply(fn, arguments);

      called = true;

      return memo;
   };
}

/**
 * accessor for index of elem in array, based upon it's id
 *
 * @param {Array} arr - array to search
 * @param {Object} elem - element to find in array
 *
 * @return {Number} index of element in array or -1 if not found
 */
function getIndex(arr, elem) {
   var i,
       l = arr.length;

   for (i = 0; i < l; ++i) {
      if (elem.id === arr[i].id) return i;
   }

   return -1;
}

/**
 * generate a scaling function for the given input/output ranges
 *
 * @param {Number} inputMin - smallest expected value for input
 * @param {Number} inputMax - largest expected value for input
 * @param {Number} outputMin - smallest desired output
 * @param {Number} outputMax - largest desired output
 *
 * @return {Number} where ouputMin <= output <= outputMax
 */
function generateScale(inputMin, inputMax, outputMin, outputMax) {
   var inputDiff = inputMax - inputMin,
       outputDiff = outputMax - outputMin;

   return function _scale(x) {
      var test = (outputDiff * (x - inputMin) / inputDiff) + outputMin;

      return test < outputMin ? outputMin : test > outputMax ? outputMax : test;
   };   
}

module.exports = {
   clone: clone,
   slice: slice,
   splice: splice,
   reduce: reduce,
   existy: existy,
   dispatch: dispatch,
   noop: function(){},
   identity: identity,
   curry: curry,
   partial: partial,
   compose: compose,
   sortNumeric: sortNumeric,
   values: values,
   memoize: memoize,
   getIndex: getIndex,
   genScale: generateScale
};
