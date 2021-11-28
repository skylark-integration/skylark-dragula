/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-devices-points/mouse","skylark-devices-points/touch","skylark-domx-noder","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler"],function(t,e,n,o,r,i,u,c){"use strict";function h(t){return t.targetTouches&&t.targetTouches.length?t.targetTouches[0]:t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:t}return{touchy:function(t,e,o,r){"add"==e?u.on(t,o,r):u.off(t,o,r),t.touchInited||(t.touchInited=!0,n.mousy(t))},whichMouseButton:function(t){if(void 0!==t.touches)return t.touches.length;if(void 0!==t.which&&0!==t.which)return t.which;if(void 0!==t.buttons)return t.buttons;var e=t.button;return void 0!==e?1&e?1:2&e?3:4&e?2:0:void 0},getRectWidth:function(t){return t.width||t.right-t.left},getRectHeight:function(t){return t.height||t.bottom-t.top},getEventHost:h,getCoord:function(t,e){var n=h(e),o={pageX:"clientX",pageY:"clientY"};return t in o&&!(t in n)&&o[t]in n&&(t=o[t]),n[t]}}});
//# sourceMappingURL=sourcemaps/_helpers.js.map
