define([
  "skylark-langx/skylark",
  "skylark-langx-emitter/Emitter",
  "skylark-devices-points/mouse",
  "skylark-devices-points/touch",
  "skylark-domx-noder",
  "skylark-domx-finder",
  "skylark-domx-geom",
  "skylark-domx-eventer",
  "skylark-domx-styler",
  "./_helpers"
],function(
  skylark,
  Emitter,
  mouse,
  touch,
  noder,
  finder,
  geom,
  eventer,
  styler,
  helpers
){
    'use strict';


    var Drake = Emitter.inherit({
        _source : null,   // source container
        _item : null,     // item being dragged
        _initialSibling : null, // reference sibling when grabbed
        _currentSibling : null, // reference sibling now
        _renderTimer : null, // timer for setTimeout renderMirrorImage
        _copy : null, // item used for copying
        _lastDropTarget : null, // last container item was over

        _prepareArgs : function(e,args) {
            return args;
        },
        init : function(options) {
            this.containers = options.containers;
            this.destroy = options.destroy;
            this.options = options;
        },

        isContainer : function(el) {
            return this.containers.indexOf(el) !== -1 || this.options.isContainer(el);
        },
   
        isCopy : function  (item, container) {
            var o = this.options;
            return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
        },


        findDropTarget : function  (clientX, clientY) {
            var elementBehindCursor  = noder.fromPoint(clientX, clientY),
                target = elementBehindCursor,
                self = this;

            while (target && !accepted()) {
              target = finder.parent(target);
            }

            return target;

            function accepted () {
              var droppable = self.isContainer(target);
              if (droppable === false) {
                return false;
              }

              var immediate = self.getImmediateChild(target, elementBehindCursor);
              var reference = self.getReference(target, immediate, clientX, clientY);
              var initial = self.isInitialPlacement(target, reference);
              if (initial) {
                return true; // should always be able to drop it right back where it was
              }
              return self.options.accepts(self._item, target, self._source, reference);
            }
        },

        isInitialPlacement : function  (target, s) {
            var sibling;
            if (s !== void 0) {
              sibling = s;
            ///} else if (_mirror) {
            ///  sibling = _currentSibling;
            } else {
              sibling = finder.nextSibling(this._copy || this._item);
            }
            return target === this._source && sibling === this._initialSibling;
        },

        getReference : function(dropTarget, target, x, y) {
            var o = this.options;

            var horizontal = o.direction === 'horizontal';

            if (target !== dropTarget) {
                return inside();
            }  else {
                return  outside();
            }

            return reference;

            function outside () { // slower, but able to figure out any position
              var len = dropTarget.children.length;

              for (let i = 0; i < len; i++) {
                let el = dropTarget.children[i];
                //rect = el.getBoundingClientRect();
                let rect = geom.boundingRect(el);
                if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
                if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
              }
              return null;
            }


            function inside () { // faster, but only available if dropped inside a child element
              
              //var rect = target.getBoundingClientRect();
              var  rect = geom.boundingRect(target);
              if (horizontal) {
                return resolve(x > rect.left + helpers.getRectWidth(rect) / 2);
              }
              return resolve(y > rect.top + helpers.getRectHeight(rect) / 2);
              
            }

            function resolve (after) {
              return after ? finder.nextSibling(target) : target;
            }
        },


        getImmediateChild :   function(dropTarget, target) {
            var immediate = target;
            while (immediate !== dropTarget && finder.parent(immediate) !== dropTarget) {
              immediate = finder.parent(immediate);
            }
            if (immediate === noder.root()) {
              return null;
            }
            return immediate;
        },

        canStart : function (item) {
            ///if (drake.dragging && _mirror) {
            if (this.dragging) {
              return;
            }
            if (this.isContainer(item)) {
              return; // don't drag container itself
            }

            if (this.options.ignoreInputTextSelection) {
                ///var clientX = getCoord('clientX', e);
                ///var clientY = getCoord('clientY', e);
                /////var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
                ///var elementBehindCursor = noder.fromPoint(clientX,clientY);
                ///if (noder.isInput(elementBehindCursor)) {
                if (noder.isInput(item)){
                    return;
                }
            }


            var handle = item;
            var o = this.options;
            while (finder.parent(item) && this.isContainer(finder.parent(item)) === false) {
              if (o.invalid(item, handle)) {
                return;
              }
              item = finder.parent(item); // drag target should be a top element
              if (!item) {
                return;
              }
            }
            var source = finder.parent(item);
            if (!source) {
              return;
            }
            if (o.invalid(item, handle)) {
              return;
            }

            var movable = o.moves(item, source, handle, finder.nextSibling(item));
            if (!movable) {
              return;
            }

            return {
              item: item,
              source: source
            };
        },

        canMove : function  (item) {
            return !! this.canStart(item);
        },

        manualStart : function (item) {
            var context = this.canStart(item);
            if (context) {
                this.start(context);
            }
        },

        start : function(context) {
            if (this.isCopy(context.item, context.source)) {
              this._copy = context.item.cloneNode(true);
              this.emit('cloned', this._copy, context.item, 'copy');
            }

            this._source = context.source;
            this._item = context.item;
            this._initialSibling = this._currentSibling = finder.nextSibling(context.item);

            this.dragging = true;
            this.emit('drag', this._item, this._source);
        },

        over : function(clientX,clientY) {
            var o = this.options,
                item = this._copy || this._item,
                self = this;


            var elementBehindCursor = noder.fromPoint( clientX, clientY);
            var dropTarget = this.findDropTarget(clientX, clientY);
            var changed = dropTarget !== null && dropTarget !== this._lastDropTarget;
            if (changed || dropTarget === null) {
              out();
              this._lastDropTarget = dropTarget;
              over();
            }
            var parent = finder.parent(item);
            if (dropTarget === this._source && this._copy && !o.copySortSource) {
              if (parent) {
                parent.removeChild(item);
              }
              return;
            }

            var reference;
            var immediate = this.getImmediateChild(dropTarget, elementBehindCursor);
            if (immediate !== null) {
              reference = this.getReference(dropTarget, immediate, clientX, clientY);
            } else if (o.revertOnSpill === true && !this._copy) {
              reference = this._initialSibling;
              dropTarget = this._source;
            } else {
              if (this._copy && parent) {
                parent.removeChild(item);
              }
              return;
            }
            if (
              (reference === null && changed) ||
              reference !== item &&
              reference !== finder.nextSibling(item)
            ) {
              this._currentSibling = reference;
              dropTarget.insertBefore(item, reference);
              this.emit('shadow', item, dropTarget, this._source);
            }

            
            function moved (type) { 
                self.emit(type, item, self._lastDropTarget, self._source); 
            }
            
            function over () { 
                if (changed) { 
                    moved('over'); 
                } 
            }
            
            function out () { 
                if (self._lastDropTarget) { 
                    moved('out'); 
                } 
            }
        },

        end : function() {
            if (!this.dragging) {
              return;
            }
            var item = this._copy || this._item;
            this.drop(item, finder.parent(item));
        },

        drop : function(item, target) {
            var parent = finder.parent(item);
            if (this._copy && this.options.copySortSource && target === this._source) {
              parent.removeChild(this._item);
            }
            if (this.isInitialPlacement(target)) {
              this.emit('cancel', item, this._source, this._source);
            } else {
              this.emit('drop', item, target, this._source, this._currentSibling);
            }
            this.cleanup();
        },

        remove : function () {
            if (!this.dragging) {
              return;
            }
            var item = this._copy || this._item;
            var parent = finder.parent(item);
            if (parent) {
              parent.removeChild(item);
            }
            this.emit(_copy ? 'cancel' : 'remove', item, parent, this._source);
            this.cleanup();
        },

        cancel : function  (revert) {
            if (!this.dragging) {
              return;
            }
            var o = this.options;

            var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
            var item = this._copy || this._item;
            var parent = finder.parent(item);
            var initial = this.isInitialPlacement(parent);
            if (initial === false && reverts) {
              if (this._copy) {
                if (parent) {
                  parent.removeChild(this._copy);
                }
              } else {
                this._source.insertBefore(item, this._initialSibling);
              }
            }
            if (initial || reverts) {
              this.emit('cancel', item, this._source, this._source);
            } else {
              this.emit('drop', item, parent, this._source, this._currentSibling);
            }
            this.cleanup();
        },

        cleanup : function  () {
            var item = this._copy || this._item;
            ///ungrab();
            ///removeMirrorImage();
            if (item) {
              styler.removeClass(item, 'gu-transit');
            }
            if (this._renderTimer) {
              clearTimeout(_renderTimer);
            }
            this.dragging = false;
            if (this._lastDropTarget) {
              this.emit('out', item, this._lastDropTarget, this._source);
            }
            this.emit('dragend', item);

            this._source = 
            this._item = 
            this._copy = 
            this._initialSibling = 
            this._currentSibling = 
            this._renderTimer = 
            this._lastDropTarget = null;
        }


    });

    
    return Drake;
});