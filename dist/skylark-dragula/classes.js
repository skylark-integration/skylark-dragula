/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
define([],function(){var a={},e="(?:^|\\s)",n="(?:\\s|$)";function s(s){var t=a[s];return t?t.lastIndex=0:a[s]=t=new RegExp(e+s+n,"g"),t}return{add:function(a,e){var n=a.className;n.length?s(e).test(n)||(a.className+=" "+e):a.className=e},rm:function(a,e){a.className=a.className.replace(s(e)," ").trim()}}});
//# sourceMappingURL=sourcemaps/classes.js.map
