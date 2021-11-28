/**
 * skylark-dragula - A version of dragula.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-dragula/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-domx-plugins-dnd/draggable',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-devices-points/touch",
    "skylark-domx-plugins-base",
    "./dnd",
    "./manager"
], function(langx, noder, datax, finder, geom, eventer, styler, touch, plugins, dnd,manager) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;



    var Draggable = plugins.Plugin.inherit({
        klassName: "Draggable",
        
        pluginName : "lark.dnd.draggable",

        options : {
            draggingClass : "dragging",
            forceFallback : false
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            var self = this,
                options = this.options;

            self.draggingClass = options.draggingClass;

            ["preparing", "started", "ended", "moving"].forEach(function(eventName) {
                if (langx.isFunction(options[eventName])) {
                    self.on(eventName, options[eventName]);
                }
            });

            touch.mousy(elm);

            eventer.on(elm, {
                "mousedown": function(e) {
                    var options = self.options;
                    if (options.handle) {
                        if (langx.isFunction(options.handle)) {
                            self.dragHandle = options.handle(e.target,self._elm);
                        } else {
                            self.dragHandle = finder.closest(e.target, options.handle,self._elm);
                        }
                        if (!self.dragHandle) {
                            return;
                        }
                    }
                    if (options.source) {
                        if (langx.isFunction(options.source)) {
                            self.dragSource =  options.source(e.target, self._elm);                            
                        } else {
                            self.dragSource = finder.closest(e.target, options.source,self._elm);                            
                        }
                    } else {
                        self.dragSource = self._elm;
                    }

                    self.startPos = {
                        x : e.clientX,
                        y : e.clientY
                    };

                    manager.prepare(self,e);

                },

                "mouseup": function(e) {
                    ///if (self.dragSource) {
                    ///    //datax.attr(self.dragSource, "draggable", 'false');
                    ///    self.dragSource = null;
                    ///    self.dragHandle = null;
                    ///}
                },

                "dragstart": function(e) {
                    if (manager.dragging !== self) {
                        return;
                    }
                    manager.start(self, e);
                },

                "dragend": function(e) {
                    if (manager.dragging !== self) {
                        return;
                    }
                    eventer.stop(e);

                    if (!manager.dragging) {
                        return;
                    }

                    manager.end(false);
                }
            });

        }

    });

    plugins.register(Draggable,"draggable");

    return dnd.Draggable = Draggable;
});
define('skylark-domx-plugins-dnd/droppable',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "./dnd",
    "./manager"
], function(langx, noder, datax, finder, geom, eventer, styler, plugins, dnd,manager) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;


    var Droppable = plugins.Plugin.inherit({
        klassName: "Droppable",

        pluginName : "lark.dnd.droppable",

        options : {
            draggingClass : "dragging"
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            var self = this,
                options = self.options,
                draggingClass = options.draggingClass,
                hoverClass,
                activeClass,
                acceptable = true;

            ["started", "entered", "leaved", "dropped", "overing"].forEach(function(eventName) {
                if (langx.isFunction(options[eventName])) {
                    self.on(eventName, options[eventName]);
                }
            });

            eventer.on(elm, {
                "dragover": function(e) {
                    e.stopPropagation()

                    if (!acceptable) {
                        return
                    }

                    var e2 = eventer.create("overing", {
                        originalEvent : e,
                        overElm: e.target,
                        transfer: manager.draggingTransfer,
                        acceptable: true
                    });
                    self.trigger(e2);

                    if (e2.acceptable) {
                        e.preventDefault() // allow drop

                        ///e.dataTransfer.dropEffect = "copyMove";
                    }

                },

                "dragenter": function(e) {
                    var options = self.options,
                        elm = self._elm;

                    var e2 = eventer.create("entered", {
                        originalEvent : e,
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    e.stopPropagation()

                    if (hoverClass && acceptable) {
                        styler.addClass(elm, hoverClass)
                    }
                },

                "dragleave": function(e) {
                    var options = self.options,
                        elm = self._elm;
                    if (!acceptable) return false

                    var e2 = eventer.create("leaved", {
                        originalEvent : e,
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    e.stopPropagation()

                    if (hoverClass && acceptable) {
                        styler.removeClass(elm, hoverClass);
                    }
                },

                "drop": function(e) {
                    var options = self.options,
                        elm = self._elm;

                    eventer.stop(e); // stops the browser from redirecting.

                    if (!manager.dragging) return

                    // manager.dragging.elm.removeClass('dragging');

                    if (hoverClass && acceptable) {
                        styler.addClass(elm, hoverClass)
                    }

                    var e2 = eventer.create("dropped", {
                        originalEvent : e,
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    manager.end(true)
                }
            });

            manager.on("dndStarted", function(e) {
                var e2 = eventer.create("started", {
                    transfer: manager.draggingTransfer,
                    acceptable: false,
                    dragging : e.dragging 
                });

                self.trigger(e2);

                acceptable = e2.acceptable;
                hoverClass = e2.hoverClass;
                activeClass = e2.activeClass;

                if (activeClass && acceptable) {
                    styler.addClass(elm, activeClass);
                }

            }).on("dndEnded", function(e) {
                var e2 = eventer.create("ended", {
                    transfer: manager.draggingTransfer,
                    acceptable: false
                });

                self.trigger(e2);

                if (hoverClass && acceptable) {
                    styler.removeClass(elm, hoverClass);
                }
                if (activeClass && acceptable) {
                    styler.removeClass(elm, activeClass);
                }

                acceptable = false;
                activeClass = null;
                hoverClass = null;
            });

        }
    });

    plugins.register(Droppable,"droppable");

    return dnd.Droppable = Droppable;
});
define('skylark-langx-emitter/Emitter',[
    "skylark-langx-events"
],function(events){
    return events.Emitter;
});
define('skylark-dragula/_helpers',[
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
define('skylark-dragula/_drake',[
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
            this.dragging = false;

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
define('skylark-dragula/dragula',[
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

define('skylark-dragula/main',[
	"./dragula"
],function(dragula){
	return dragula;
});
define('skylark-dragula', ['skylark-dragula/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-dragula.js.map
