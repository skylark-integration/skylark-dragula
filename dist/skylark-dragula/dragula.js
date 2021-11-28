/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-devices-points/mouse","skylark-devices-points/touch","skylark-domx-noder","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","./_drake","./_listen"],function(e,r,o,n,i,t,a,d,s,l){"use strict";return e.attach("intg.dragula",function(e,r){1===arguments.length&&!1===Array.isArray(e)&&(r=e,e=[]);var o=r||{};void 0===o.moves&&(o.moves=a),void 0===o.accepts&&(o.accepts=a),void 0===o.invalid&&(o.invalid=function(){return!1}),void 0===o.containers&&(o.containers=e||[]),void 0===o.isContainer&&(o.isContainer=function(){return!1}),void 0===o.copy&&(o.copy=!1),void 0===o.copySortSource&&(o.copySortSource=!1),void 0===o.revertOnSpill&&(o.revertOnSpill=!1),void 0===o.removeOnSpill&&(o.removeOnSpill=!1),void 0===o.direction&&(o.direction="vertical"),void 0===o.ignoreInputTextSelection&&(o.ignoreInputTextSelection=!0),void 0===o.mirrorContainer&&(o.mirrorContainer=n.body()),o.destroy=function(){t.events(!0),t.release({})};var i=new s(o);!0===o.removeOnSpill&&i.on("over",function(e){d.removeClass(e,"gu-hide")}).on("out",function(e){i.dragging&&d.addClass(e,"gu-hide")});var t=l(i,o);return t.events(),i;function a(){return!0}})});
//# sourceMappingURL=sourcemaps/dragula.js.map
