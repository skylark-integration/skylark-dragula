define([
  "skylark-langx/skylark",
  "skylark-devices-points/mouse",
  "skylark-devices-points/touch",
  "skylark-domx-noder",
  "skylark-domx-finder",
  "skylark-domx-geom",
  "skylark-domx-eventer",
  "skylark-domx-styler",
  "skylark-domx-plugins-dnd/draggable",
  "skylark-domx-plugins-dnd/droppable",
  "./_drake"
],function(
  skylark,
  mouse,
  touch,
  noder,
  finder,
  geom,
  eventer,
  styler,
  DndDraggable,
  DndDroppable,
  Drake
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



      ///var listener = listen(drake,o);
      ///listener.events();



      var _context;

      drake.draggable = new  DndDraggable(noder.body(),{
            ///source : options.items,
            ///handle : options.handle,
            ///draggingClass : options.draggingClass,
            preparing : function(e) {
                _context = drake.canStart(e.originalEvent.target);
                if (_context) {
                  e.dragSource = _context.item;
                } else {
                  e.dragSource = null;
                }
            },
            started :function(e) {
                e.ghost = e.dragSource;
                drake.start(_context);

            },
            ended : function(e) {
               drake.end();
               _context = null;              
            },
            drake
        });

        
        drake.droppable = new DndDroppable(noder.body(),{
            started: function(e) {
                if (e.dragging === drake.draggable) {
                  e.acceptable = true;
                  e.activeClass = "active";
                  e.hoverClass = "over";                 
                }
            },
            overing : function(e) {
              drake.over(e.originalEvent.clientX,e.originalEvent.clientY);
            },
            dropped : function(e) {
              //drake.end();
            },
            drake

        });
      return drake;

   

      function destroy () {
        ///listener.events(true);
        ///listener.release({});
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
