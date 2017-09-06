/**
 * @module mdkeywords
 */

(function (name, context, definition) {
  if(typeof exports == 'object') {
    module.exports = definition(require);
  } else if(typeof define == 'function' && define.amd) {
    define(definition);
  } else if(typeof YUI == "function") {
    YUI.add(name, definition, '@VERSION@', {
      requires: []
    });
  } else {
    context[name] = definition();
  }
})
.call(this, 'mdkeywords', this, function (require) {
  'use strict';

  // imports
  return [
    (typeof require == 'function') ? require(
      './lib/js/lcc-category') : window.lccCategory,
    (typeof require == 'function') ? require(
      './lib/js/lcc-deliverabletype') : window.lccDeliverabletype,
    (typeof require == 'function') ? require(
      './lib/js/lcc-usertype') : window.lccUsertype
  ];
});
