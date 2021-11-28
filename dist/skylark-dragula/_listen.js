/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-devices-points/mouse","skylark-devices-points/touch","skylark-domx-noder","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","./_helpers"],function(e,t,o,r,n,i,a,c,l){"use strict";var s=r.root();return function(e,t){var o,u,d,m,v,f;function g(e){v&&e.preventDefault()}function p(e){var t=e?"remove":"add";l.touchy(s,t,"mousemove",h)}function y(e){var t=e?"off":"on";a[t](s,"selectstart",g),a[t](s,"click",g)}function k(t){if(d=t.clientX,m=t.clientY,1===l.whichMouseButton(t)&&!t.metaKey&&!t.ctrlKey){var o=t.target,n=e.canStart(o);n&&(v=n,p(),"mousedown"===t.type&&(r.isInput(o)?o.focus():t.preventDefault()))}}function h(r){if(v)if(0!==l.whichMouseButton(r)){if(void 0===r.clientX||r.clientX!==d||void 0===r.clientY||r.clientY!==m){var n=v;p(!0),y(),e.end(),e.start(n);var a=i.pagePosition(e._item);o=l.getCoord("pageX",r)-a.left,u=l.getCoord("pageY",r)-a.top,c.addClass(e._copy||e._item,"gu-transit"),function(){if(!f){var o=e._item.getBoundingClientRect();(f=e._item.cloneNode(!0)).style.width=l.getRectWidth(o)+"px",f.style.height=l.getRectHeight(o)+"px",c.removeClass(f,"gu-transit"),c.addClass(f,"gu-mirror"),t.mirrorContainer.appendChild(f),l.touchy(s,"add","mousemove",x),c.addClass(t.mirrorContainer,"gu-unselectable"),e.emit("cloned",f,e._item,"mirror")}}(),x(r)}}else _({})}function C(){v=!1,p(!0),y(!0)}function _(o){if(C(),f&&(c.removeClass(t.mirrorContainer,"gu-unselectable"),l.touchy(s,"remove","mousemove",x),n.parent(f).removeChild(f),f=null),e.dragging){var r=e._copy||e._item,i=l.getCoord("clientX",o),a=l.getCoord("clientY",o),u=e.findDropTarget(i,a);u&&(e._copy&&t.copySortSource||!e._copy||u!==e._source)?e.drop(r,u):t.removeOnSpill?e.remove():e.cancel()}}function x(t){if(f){t.preventDefault();var r,n,i=l.getCoord("clientX",t),a=l.getCoord("clientY",t);r=i-o,n=a-u,f.style.left=r+"px",f.style.top=n+"px",e.over(i,a)}}return{events:function(e){var t=e?"remove":"add";l.touchy(s,t,"mousedown",k),l.touchy(s,t,"mouseup",_)},grab:k,ungrab:C,release:_}}});
//# sourceMappingURL=sourcemaps/_listen.js.map
