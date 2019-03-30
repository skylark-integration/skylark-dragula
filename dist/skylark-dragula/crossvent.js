/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
define(["./custom-event","./eventmap"],function(e,t){"use strict";var n=window,r=n.document,a=function(e,t,n,r){return e.addEventListener(t,n,r)},i=function(e,t,n,r){return e.removeEventListener(t,n,r)},c=[];function u(e,t,n){var r=function(e,t,n){var r,a;for(r=0;r<c.length;r++)if((a=c[r]).element===e&&a.type===t&&a.fn===n)return r}(e,t,n);if(r){var a=c[r].wrapper;return c.splice(r,1),a}}return n.addEventListener||(a=function(e,t,r){return e.attachEvent("on"+t,function(e,t,r){var a=u(e,t,r)||function(e,t,r){return function(t){var a=t||n.event;a.target=a.target||a.srcElement,a.preventDefault=a.preventDefault||function(){a.returnValue=!1},a.stopPropagation=a.stopPropagation||function(){a.cancelBubble=!0},a.which=a.which||a.keyCode,r.call(e,a)}}(e,0,r);return c.push({wrapper:a,element:e,type:t,fn:r}),a}(e,t,r))},i=function(e,t,n){var r=u(e,t,n);if(r)return e.detachEvent("on"+t,r)}),{add:a,remove:i,fabricate:function(n,a,i){var c=-1===t.indexOf(a)?new e(a,{detail:i}):function(){var e;return r.createEvent?(e=r.createEvent("Event")).initEvent(a,!0,!0):r.createEventObject&&(e=r.createEventObject()),e}();n.dispatchEvent?n.dispatchEvent(c):n.fireEvent("on"+a,c)}}});
//# sourceMappingURL=sourcemaps/crossvent.js.map
