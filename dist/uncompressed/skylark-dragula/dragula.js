define([
  "skylark-langx/skylark",
  "skylark-devices-points/mouse",
  "skylark-devices-points/touch",
  "skylark-domx-noder",
  "skylark-domx-finder",
  "skylark-domx-geom",
  "skylark-domx-eventer",
  "skylark-domx-styler",
  "./_drake",
  "./_listen"
],function(
  skylark,
  mouse,
  touch,
  noder,
  finder,
  geom,
  eventer,
  styler,
  Drake,
  listen
){

    'use strict';


    function dragula (initialContainers, options) {
      var len = arguments.length;
      if (len === 1 && Array.isArray(initialContainers) === false) {
        options = initialContainers;
        initialContainers = [];
      }

      var o = options || {};
      if (o.moves === void 0) { o.moves = always; }
      if (o.accepts === void 0) { o.accepts = always; }
      if (o.invalid === void 0) { o.invalid = invalidTarget; }
      if (o.containers === void 0) { o.containers = initialContainers || []; }
      if (o.isContainer === void 0) { o.isContainer = never; }
      if (o.copy === void 0) { o.copy = false; }
      if (o.copySortSource === void 0) { o.copySortSource = false; }
      if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
      if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
      if (o.direction === void 0) { o.direction = 'vertical'; }
      if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
      if (o.mirrorContainer === void 0) { o.mirrorContainer = noder.body(); }

      o.destroy = destroy;
      var drake = new Drake(o);

      if (o.removeOnSpill === true) {
        drake.on('over', spillOver).on('out', spillOut);
      }

      var listener = listen(drake,o);
      listener.events();

      return drake;

   

      function destroy () {
        listener.events(true);
        listener.release({});
      }

      function never () { 
        return false; 
      }
      function always () { 
        return true; 
      }

      function invalidTarget () {
        return false;
      }


      function spillOver (el) {
        styler.removeClass(el, 'gu-hide');
      }

      function spillOut (el) {
        if (drake.dragging) { styler.addClass(el, 'gu-hide'); }
      }

    }



    return skylark.attach("intg.dragula",dragula);

});
