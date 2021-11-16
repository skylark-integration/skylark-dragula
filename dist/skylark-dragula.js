/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
!function(e,n){var r=n.define,require=n.require,t="function"==typeof r&&r.amd,i=!t&&"undefined"!=typeof exports;if(!t&&!r){var o={};r=n.define=function(e,n,r){"function"==typeof r?(o[e]={factory:r,deps:n.map(function(n){return function(e,n){if("."!==e[0])return e;var r=n.split("/"),t=e.split("/");r.pop();for(var i=0;i<t.length;i++)"."!=t[i]&&(".."==t[i]?r.pop():r.push(t[i]));return r.join("/")}(n,e)}),resolved:!1,exports:null},require(e)):o[e]={factory:null,resolved:!0,exports:r}},require=n.require=function(e){if(!o.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var module=o[e];if(!module.resolved){var r=[];module.deps.forEach(function(e){r.push(require(e))}),module.exports=module.factory.apply(n,r)||null,module.resolved=!0}return module.exports}}if(!r)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,require){e("skylark-dragula/emitter",["skylark-langx-emitter/Emitter"],function(e){var n=e.inherit({_prepareArgs:function(e,n){return n},init:function(e,n){void 0===e&&(e={}),Object.assign(this,e)}});return n}),e("skylark-dragula/crossvent",["skylark-domx-eventer"],function(e){return{add:e.on,remove:e.off}}),e("skylark-dragula/classes",["skylark-domx-styler"],function(e){return{add:e.addClass,rm:e.removeClass}}),e("skylark-dragula/dragula",["skylark-langx/skylark","skylark-devices-points/mouse","skylark-devices-points/touch","skylark-domx-noder","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","./emitter","./crossvent","./classes"],function(e,n,r,t,i,o,u,a,c,l){"use strict";var d=window,f=d.document,s=f.documentElement;function v(e,n,t,i){"add"==n?u.on(e,t,i):u.off(e,t,i),e.touchInited||(e.touchInited=!0,r.mousy(e))}function m(e){if(void 0!==e.touches)return e.touches.length;if(void 0!==e.which&&0!==e.which)return e.which;if(void 0!==e.buttons)return e.buttons;var n=e.button;return void 0!==n?1&n?1:2&n?3:4&n?2:0:void 0}function g(e,n,r){return f.elementFromPoint(n,r)}function p(){return!1}function h(){return!0}function y(e){return e.width||e.right-e.left}function k(e){return e.height||e.bottom-e.top}function x(e){return i.parent(e)}function S(e){return t.isInput(e)}function C(e){return i.nextSibling(e)}function w(e,n){var r=function(e){if(e.targetTouches&&e.targetTouches.length)return e.targetTouches[0];if(e.changedTouches&&e.changedTouches.length)return e.changedTouches[0];return e}(n),t={pageX:"clientX",pageY:"clientY"};return e in t&&!(e in r)&&t[e]in r&&(e=t[e]),r[e]}return e.attach("intg.dragula",function(e,n){var r,i,u,d,b,O,T,X,Y,I,E;1===arguments.length&&!1===Array.isArray(e)&&(n=e,e=[]);var j,P=null,q=n||{};void 0===q.moves&&(q.moves=h);void 0===q.accepts&&(q.accepts=h);void 0===q.invalid&&(q.invalid=function(){return!1});void 0===q.containers&&(q.containers=e||[]);void 0===q.isContainer&&(q.isContainer=p);void 0===q.copy&&(q.copy=!1);void 0===q.copySortSource&&(q.copySortSource=!1);void 0===q.revertOnSpill&&(q.revertOnSpill=!1);void 0===q.removeOnSpill&&(q.removeOnSpill=!1);void 0===q.direction&&(q.direction="vertical");void 0===q.ignoreInputTextSelection&&(q.ignoreInputTextSelection=!0);void 0===q.mirrorContainer&&(q.mirrorContainer=f.body);var A=a({containers:q.containers,start:function(e){var n=F(e);n&&_(n)},end:G,cancel:U,remove:Q,destroy:function(){D(!0),J({})},canMove:function(e){return!!F(e)},dragging:!1});!0===q.removeOnSpill&&A.on("over",function(e){l.rm(e,"gu-hide")}).on("out",function(e){A.dragging&&l.add(e,"gu-hide")});return D(),A;function B(e){return-1!==A.containers.indexOf(e)||q.isContainer(e)}function D(e){var n=e?"remove":"add";v(s,n,"mousedown",N),v(s,n,"mouseup",J)}function R(e){var n=e?"remove":"add";v(s,n,"mousemove",z)}function K(e){var n=e?"remove":"add";c[n](s,"selectstart",M),c[n](s,"click",M)}function M(e){j&&e.preventDefault()}function N(e){O=e.clientX,T=e.clientY;var n=1!==m(e)||e.metaKey||e.ctrlKey;if(!n){var r=e.target,t=F(r);t&&(j=t,R(),"mousedown"===e.type&&(S(r)?r.focus():e.preventDefault()))}}function z(e){if(j)if(0!==m(e)){if(void 0===e.clientX||e.clientX!==O||void 0===e.clientY||e.clientY!==T){if(q.ignoreInputTextSelection){var n=w("clientX",e),i=w("clientY",e),a=t.fromPoint(n,i);if(S(a))return}var c=j;R(!0),K(),G(),_(c);var f,g=(f=u,o.pagePosition(f));d=w("pageX",e)-g.left,b=w("pageY",e)-g.top,l.add(I||u,"gu-transit"),function(){if(r)return;var e=u.getBoundingClientRect();(r=u.cloneNode(!0)).style.width=y(e)+"px",r.style.height=k(e)+"px",l.rm(r,"gu-transit"),l.add(r,"gu-mirror"),q.mirrorContainer.appendChild(r),v(s,"add","mousemove",$),l.add(q.mirrorContainer,"gu-unselectable"),A.emit("cloned",r,u,"mirror")}(),$(e)}}else J({})}function F(e){if(!(A.dragging&&r||B(e))){for(var n=e;x(e)&&!1===B(x(e));){if(q.invalid(e,n))return;if(!(e=x(e)))return}var t=x(e);if(t&&!q.invalid(e,n)){var i=q.moves(e,t,n,C(e));if(i)return{item:e,source:t}}}}function _(e){var n,r;n=e.item,r=e.source,("boolean"==typeof q.copy?q.copy:q.copy(n,r))&&(I=e.item.cloneNode(!0),A.emit("cloned",I,e.item,"copy")),i=e.source,u=e.item,X=Y=C(e.item),A.dragging=!0,A.emit("drag",u,i)}function G(){if(A.dragging){var e=I||u;L(e,x(e))}}function H(){j=!1,R(!0),K(!0)}function J(e){if(H(),A.dragging){var n=I||u,t=w("clientX",e),o=w("clientY",e),a=g(r,t,o),c=Z(a,t,o);c&&(I&&q.copySortSource||!I||c!==i)?L(n,c):q.removeOnSpill?Q():U()}}function L(e,n){var r=x(e);I&&q.copySortSource&&n===i&&r.removeChild(u),W(n)?A.emit("cancel",e,i,i):A.emit("drop",e,n,i,Y),V()}function Q(){if(A.dragging){var e=I||u,n=x(e);n&&n.removeChild(e),A.emit(I?"cancel":"remove",e,n,i),V()}}function U(e){if(A.dragging){var n=arguments.length>0?e:q.revertOnSpill,r=I||u,t=x(r),o=W(t);!1===o&&n&&(I?t&&t.removeChild(I):i.insertBefore(r,X)),o||n?A.emit("cancel",r,i,i):A.emit("drop",r,t,i,Y),V()}}function V(){var e=I||u;H(),r&&(l.rm(q.mirrorContainer,"gu-unselectable"),v(s,"remove","mousemove",$),x(r).removeChild(r),r=null),e&&l.rm(e,"gu-transit"),E&&clearTimeout(E),A.dragging=!1,P&&A.emit("out",e,P,i),A.emit("dragend",e),i=u=I=X=Y=E=P=null}function W(e,n){var t;return t=void 0!==n?n:r?Y:C(I||u),e===i&&t===X}function Z(e,n,r){for(var t=e;t&&!o();)t=x(t);return t;function o(){var o=B(t);if(!1===o)return!1;var a=ee(t,e),c=ne(t,a,n,r),l=W(t,c);return!!l||q.accepts(u,t,i,c)}}function $(e){if(r){e.preventDefault();var n=w("clientX",e),t=w("clientY",e),o=n-d,a=t-b;r.style.left=o+"px",r.style.top=a+"px";var c=I||u,l=g(r,n,t),f=Z(l,n,t),s=null!==f&&f!==P;(s||null===f)&&(P&&h("out"),P=f,s&&h("over"));var v=x(c);if(f!==i||!I||q.copySortSource){var m,p=ee(f,l);if(null!==p)m=ne(f,p,n,t);else{if(!0!==q.revertOnSpill||I)return void(I&&v&&v.removeChild(c));m=X,f=i}(null===m&&s||m!==c&&m!==C(c))&&(Y=m,f.insertBefore(c,m),A.emit("shadow",c,f,i))}else v&&v.removeChild(c)}function h(e){A.emit(e,c,P,i)}}function ee(e,n){for(var r=n;r!==e&&x(r)!==e;)r=x(r);return r===s?null:r}function ne(e,n,r,t){var i="horizontal"===q.direction,u=n!==e?function(){var e=o.boundingRect(n);if(i)return a(r>e.left+y(e)/2);return a(t>e.top+k(e)/2)}():function(){var n,u,a,c=e.children.length;for(n=0;n<c;n++){if(u=e.children[n],a=o.boundingRect(u),i&&a.left+a.width/2>r)return u;if(!i&&a.top+a.height/2>t)return u}return null}();return u;function a(e){return e?C(n):n}}})}),e("skylark-dragula/main",["./dragula"],function(e){return e}),e("skylark-dragula",["skylark-dragula/main"],function(e){return e})}(r),!t){var u=require("skylark-langx-ns");i?module.exports=u:n.skylarkjs=u}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-dragula.js.map
