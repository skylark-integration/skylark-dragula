/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
define(["./atoa","./debounce"],function(n,t){"use strict";return function(e,r){var i=r||{},o={};return void 0===e&&(e={}),e.on=function(n,t){return o[n]?o[n].push(t):o[n]=[t],e},e.once=function(n,t){return t._once=!0,e.on(n,t),e},e.off=function(n,t){var r=arguments.length;if(1===r)delete o[n];else if(0===r)o={};else{var i=o[n];if(!i)return e;i.splice(i.indexOf(t),1)}return e},e.emit=function(){var t=n(arguments);return e.emitterSnapshot(t.shift()).apply(this,t)},e.emitterSnapshot=function(r){var f=(o[r]||[]).slice(0);return function(){var o=n(arguments),u=this||e;if("error"===r&&!1!==i.throws&&!f.length)throw 1===o.length?o[0]:o;return f.forEach(function(n){i.async?t(n,o,u):n.apply(u,o),n._once&&e.off(r,n)}),e}},e}});
//# sourceMappingURL=sourcemaps/emitter.js.map
