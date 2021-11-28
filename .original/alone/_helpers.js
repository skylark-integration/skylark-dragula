define([
  "skylark-langx/skylark",
  "skylark-devices-points/mouse",
  "skylark-devices-points/touch",
  "skylark-domx-noder",
  "skylark-domx-finder",
  "skylark-domx-geom",
  "skylark-domx-eventer",
  "skylark-domx-styler"
],function(
  skylark,
  mouse,
  touch,
  noder,
  finder,
  geom,
  eventer,
  styler
 ){
    'use strict';

    function touchy (el, op, type, fn) {
      if (op == "add") {
        eventer.on(el,type,fn);
      } else {
        eventer.off(el,type,fn);
      }

      if (!el.touchInited) {
        el.touchInited = true;   
        touch.mousy(el);     
      }
    }

    function whichMouseButton (e) {
    
      if (e.touches !== void 0) { return e.touches.length; }
      if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
      if (e.buttons !== void 0) { return e.buttons; }
      var button = e.button;
      if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
        return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
      }

    }


    
    function getRectWidth (rect) { 
      return rect.width || (rect.right - rect.left); 
    }
    function getRectHeight (rect) { 
      return rect.height || (rect.bottom - rect.top); 
    }


    function getEventHost (e) {
      // on touchend event, we have to use `e.changedTouches`
      // see http://stackoverflow.com/questions/7192563/touchend-event-properties
      // see https://github.com/bevacqua/dragula/issues/34
      if (e.targetTouches && e.targetTouches.length) {
        return e.targetTouches[0];
      }
      if (e.changedTouches && e.changedTouches.length) {
        return e.changedTouches[0];
      }
      return e;
    }

    function getCoord (coord, e) {
      var host = getEventHost(e);
      var missMap = {
        pageX: 'clientX', // IE8
        pageY: 'clientY' // IE8
      };
      if (coord in missMap && !(coord in host) && missMap[coord] in host) {
        coord = missMap[coord];
      }
      return host[coord];
    }

    return {
    	touchy,
    	whichMouseButton,
    	getRectWidth,
    	getRectHeight,
    	getEventHost,
    	getCoord
    };
});