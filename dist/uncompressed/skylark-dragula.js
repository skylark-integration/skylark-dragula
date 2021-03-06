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

define('skylark-dragula/emitter',[
    "skylark-langx-emitter/Emitter"
],function(Emitter){

    var Emitter2 = Emitter.inherit({
        _prepareArgs : function(e,args) {
            return args;
        },
        init : function(thing, options) {
            var opts = options || {};
            if (thing === undefined) {
                thing = {};
            }

            Object.assign(this,thing);
        }
    });

    return Emitter2;
});

/*
define([
	"./atoa",
	"./debounce"
],function(atoa,debounce){
    'use strict';

	function emitter(thing, options) {
        var opts = options || {};
        var evt = {};
        if (thing === undefined) {
            thing = {};
        }
        thing.on = function(type, fn) {
            if (!evt[type]) {
                evt[type] = [fn];
            } else {
                evt[type].push(fn);
            }
            return thing;
        };
        thing.once = function(type, fn) {
            fn._once = true; // thing.off(fn) still works!
            thing.on(type, fn);
            return thing;
        };
        thing.off = function(type, fn) {
            var c = arguments.length;
            if (c === 1) {
                delete evt[type];
            } else if (c === 0) {
                evt = {};
            } else {
                var et = evt[type];
                if (!et) {
                    return thing;
                }
                et.splice(et.indexOf(fn), 1);
            }
            return thing;
        };
        thing.emit = function() {
            var args = atoa(arguments);
            return thing.emitterSnapshot(args.shift()).apply(this, args);
        };
        thing.emitterSnapshot = function(type) {
            var et = (evt[type] || []).slice(0);
            return function() {
                var args = atoa(arguments);
                var ctx = this || thing;
                if (type === 'error' && opts.throws !== false && !et.length) {
                    throw args.length === 1 ? args[0] : args;
                }
                et.forEach(function emitter(listen) {
                    if (opts.async) {
                        debounce(listen, args, ctx);
                    } else {
                        listen.apply(ctx, args);
                    }
                    if (listen._once) {
                        thing.off(type, listen);
                    }
                });
                return thing;
            };
        };
        return thing;
    }

    return emitter;
});

*/;
define('skylark-dragula/crossvent',[
    "skylark-domx-eventer"
],function(eventer){
    return {
        add : eventer.on,
        remove : eventer.off
    }

});

/*
define([
	"./custom-event",
	"./eventmap"
],function(customEvent,eventmap){
    'use strict';
    var global = window;
    
    var doc = global.document;
    var addEvent = addEventEasy;
    var removeEvent = removeEventEasy;
    var hardCache = [];

    if (!global.addEventListener) {
        addEvent = addEventHard;
        removeEvent = removeEventHard;
    }

    function addEventEasy(el, type, fn, capturing) {
        return el.addEventListener(type, fn, capturing);
    }

    function addEventHard(el, type, fn) {
        return el.attachEvent('on' + type, wrap(el, type, fn));
    }

    function removeEventEasy(el, type, fn, capturing) {
        return el.removeEventListener(type, fn, capturing);
    }

    function removeEventHard(el, type, fn) {
        var listener = unwrap(el, type, fn);
        if (listener) {
            return el.detachEvent('on' + type, listener);
        }
    }

    function fabricateEvent(el, type, model) {
        var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
        if (el.dispatchEvent) {
            el.dispatchEvent(e);
        } else {
            el.fireEvent('on' + type, e);
        }

        function makeClassicEvent() {
            var e;
            if (doc.createEvent) {
                e = doc.createEvent('Event');
                e.initEvent(type, true, true);
            } else if (doc.createEventObject) {
                e = doc.createEventObject();
            }
            return e;
        }

        function makeCustomEvent() {
            return new customEvent(type, {
                detail: model
            });
        }
    }

    function wrapperFactory(el, type, fn) {
        return function wrapper(originalEvent) {
            var e = originalEvent || global.event;
            e.target = e.target || e.srcElement;
            e.preventDefault = e.preventDefault || function preventDefault() {
                e.returnValue = false;
            };
            e.stopPropagation = e.stopPropagation || function stopPropagation() {
                e.cancelBubble = true;
            };
            e.which = e.which || e.keyCode;
            fn.call(el, e);
        };
    }

    function wrap(el, type, fn) {
        var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
        hardCache.push({
            wrapper: wrapper,
            element: el,
            type: type,
            fn: fn
        });
        return wrapper;
    }

    function unwrap(el, type, fn) {
        var i = find(el, type, fn);
        if (i) {
            var wrapper = hardCache[i].wrapper;
            hardCache.splice(i, 1); // free up a tad of memory
            return wrapper;
        }
    }

    function find(el, type, fn) {
        var i, item;
        for (i = 0; i < hardCache.length; i++) {
            item = hardCache[i];
            if (item.element === el && item.type === type && item.fn === fn) {
                return i;
            }
        }
    }

    return  {
        add: addEvent,
        remove: removeEvent,
        fabricate: fabricateEvent
    };

});

*/;
define('skylark-dragula/classes',[
    "skylark-domx-styler"
],function(styler){
  /*
  var cache = {};
  var start = '(?:^|\\s)';
  var end = '(?:\\s|$)';

  function lookupClass (className) {
    var cached = cache[className];
    if (cached) {
      cached.lastIndex = 0;
    } else {
      cache[className] = cached = new RegExp(start + className + end, 'g');
    }
    return cached;
  }

  function addClass (el, className) {
    var current = el.className;
    if (!current.length) {
      el.className = className;
    } else if (!lookupClass(className).test(current)) {
      el.className += ' ' + className;
    }
  }

  function rmClass (el, className) {
    el.className = el.className.replace(lookupClass(className), ' ').trim();
  }

  return {
    add: addClass,
    rm: rmClass
  };
  */

  return {
    add :  styler.addClass,
    rm : styler.removeClass
  }

});
define('skylark-dragula/dragula',[
  "skylark-langx/skylark",
  "skylark-devices-points/mouse",
  "skylark-devices-points/touch",
  "skylark-domx-noder",
  "skylark-domx-finder",
  "skylark-domx-geom",
  "skylark-domx-eventer",
  "./emitter",
  "./crossvent",
  "./classes"
],function(
  skylark,
  mouse,
  touch,
  noder,
  finder,
  geom,
  eventer,
  emitter,
  crossvent,
  classes
){

    'use strict';
    var global = window;

    var doc = global.document;
    var documentElement = doc.documentElement;

    function dragula (initialContainers, options) {
      var len = arguments.length;
      if (len === 1 && Array.isArray(initialContainers) === false) {
        options = initialContainers;
        initialContainers = [];
      }
      var _mirror; // mirror image
      var _source; // source container
      var _item; // item being dragged
      var _offsetX; // reference x
      var _offsetY; // reference y
      var _moveX; // reference move x
      var _moveY; // reference move y
      var _initialSibling; // reference sibling when grabbed
      var _currentSibling; // reference sibling now
      var _copy; // item used for copying
      var _renderTimer; // timer for setTimeout renderMirrorImage
      var _lastDropTarget = null; // last container item was over
      var _grabbed; // holds mousedown context until first mousemove

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
      if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

      var drake = emitter({
        containers: o.containers,
        start: manualStart,
        end: end,
        cancel: cancel,
        remove: remove,
        destroy: destroy,
        canMove: canMove,
        dragging: false
      });

      if (o.removeOnSpill === true) {
        drake.on('over', spillOver).on('out', spillOut);
      }

      events();

      return drake;

      function isContainer (el) {
        return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
      }

      function events (remove) {
        var op = remove ? 'remove' : 'add';
        touchy(documentElement, op, 'mousedown', grab);
        touchy(documentElement, op, 'mouseup', release);
      }

      function eventualMovements (remove) {
        var op = remove ? 'remove' : 'add';
        touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
      }

      function movements (remove) {
        var op = remove ? 'remove' : 'add';
        crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
        crossvent[op](documentElement, 'click', preventGrabbed);
      }

      function destroy () {
        events(true);
        release({});
      }

      function preventGrabbed (e) {
        if (_grabbed) {
          e.preventDefault();
        }
      }

      function grab (e) {
        _moveX = e.clientX;
        _moveY = e.clientY;

        var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
        if (ignore) {
          return; // we only care about honest-to-god left clicks and touch events
        }
        var item = e.target;
        var context = canStart(item);
        if (!context) {
          return;
        }
        _grabbed = context;
        eventualMovements();
        if (e.type === 'mousedown') {
          if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
            item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
          } else {
            e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
          }
        }
      }

      function startBecauseMouseMoved (e) {
        if (!_grabbed) {
          return;
        }
        if (whichMouseButton(e) === 0) {
          release({});
          return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
        }
        // truthy check fixes #239, equality fixes #207
        if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
          return;
        }
        if (o.ignoreInputTextSelection) {
          var clientX = getCoord('clientX', e);
          var clientY = getCoord('clientY', e);
          //var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
          var elementBehindCursor = noder.fromPoint(clientX,clientY);
          if (isInput(elementBehindCursor)) {
            return;
          }
        }

        var grabbed = _grabbed; // call to end() unsets _grabbed
        eventualMovements(true);
        movements();
        end();
        start(grabbed);

        var offset = getOffset(_item);
        _offsetX = getCoord('pageX', e) - offset.left;
        _offsetY = getCoord('pageY', e) - offset.top;

        classes.add(_copy || _item, 'gu-transit');
        renderMirrorImage();
        drag(e);
      }

      function canStart (item) {
        if (drake.dragging && _mirror) {
          return;
        }
        if (isContainer(item)) {
          return; // don't drag container itself
        }
        var handle = item;
        while (getParent(item) && isContainer(getParent(item)) === false) {
          if (o.invalid(item, handle)) {
            return;
          }
          item = getParent(item); // drag target should be a top element
          if (!item) {
            return;
          }
        }
        var source = getParent(item);
        if (!source) {
          return;
        }
        if (o.invalid(item, handle)) {
          return;
        }

        var movable = o.moves(item, source, handle, nextEl(item));
        if (!movable) {
          return;
        }

        return {
          item: item,
          source: source
        };
      }

      function canMove (item) {
        return !!canStart(item);
      }

      function manualStart (item) {
        var context = canStart(item);
        if (context) {
          start(context);
        }
      }

      function start (context) {
        if (isCopy(context.item, context.source)) {
          _copy = context.item.cloneNode(true);
          drake.emit('cloned', _copy, context.item, 'copy');
        }

        _source = context.source;
        _item = context.item;
        _initialSibling = _currentSibling = nextEl(context.item);

        drake.dragging = true;
        drake.emit('drag', _item, _source);
      }

      function invalidTarget () {
        return false;
      }

      function end () {
        if (!drake.dragging) {
          return;
        }
        var item = _copy || _item;
        drop(item, getParent(item));
      }

      function ungrab () {
        _grabbed = false;
        eventualMovements(true);
        movements(true);
      }

      function release (e) {
        ungrab();

        if (!drake.dragging) {
          return;
        }
        var item = _copy || _item;
        var clientX = getCoord('clientX', e);
        var clientY = getCoord('clientY', e);
        var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
        var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
        if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
          drop(item, dropTarget);
        } else if (o.removeOnSpill) {
          remove();
        } else {
          cancel();
        }
      }

      function drop (item, target) {
        var parent = getParent(item);
        if (_copy && o.copySortSource && target === _source) {
          parent.removeChild(_item);
        }
        if (isInitialPlacement(target)) {
          drake.emit('cancel', item, _source, _source);
        } else {
          drake.emit('drop', item, target, _source, _currentSibling);
        }
        cleanup();
      }

      function remove () {
        if (!drake.dragging) {
          return;
        }
        var item = _copy || _item;
        var parent = getParent(item);
        if (parent) {
          parent.removeChild(item);
        }
        drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
        cleanup();
      }

      function cancel (revert) {
        if (!drake.dragging) {
          return;
        }
        var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
        var item = _copy || _item;
        var parent = getParent(item);
        var initial = isInitialPlacement(parent);
        if (initial === false && reverts) {
          if (_copy) {
            if (parent) {
              parent.removeChild(_copy);
            }
          } else {
            _source.insertBefore(item, _initialSibling);
          }
        }
        if (initial || reverts) {
          drake.emit('cancel', item, _source, _source);
        } else {
          drake.emit('drop', item, parent, _source, _currentSibling);
        }
        cleanup();
      }

      function cleanup () {
        var item = _copy || _item;
        ungrab();
        removeMirrorImage();
        if (item) {
          classes.rm(item, 'gu-transit');
        }
        if (_renderTimer) {
          clearTimeout(_renderTimer);
        }
        drake.dragging = false;
        if (_lastDropTarget) {
          drake.emit('out', item, _lastDropTarget, _source);
        }
        drake.emit('dragend', item);
        _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
      }

      function isInitialPlacement (target, s) {
        var sibling;
        if (s !== void 0) {
          sibling = s;
        } else if (_mirror) {
          sibling = _currentSibling;
        } else {
          sibling = nextEl(_copy || _item);
        }
        return target === _source && sibling === _initialSibling;
      }

      function findDropTarget (elementBehindCursor, clientX, clientY) {
        var target = elementBehindCursor;
        while (target && !accepted()) {
          target = getParent(target);
        }
        return target;

        function accepted () {
          var droppable = isContainer(target);
          if (droppable === false) {
            return false;
          }

          var immediate = getImmediateChild(target, elementBehindCursor);
          var reference = getReference(target, immediate, clientX, clientY);
          var initial = isInitialPlacement(target, reference);
          if (initial) {
            return true; // should always be able to drop it right back where it was
          }
          return o.accepts(_item, target, _source, reference);
        }
      }

      function drag (e) {
        if (!_mirror) {
          return;
        }
        e.preventDefault();

        var clientX = getCoord('clientX', e);
        var clientY = getCoord('clientY', e);
        var x = clientX - _offsetX;
        var y = clientY - _offsetY;

        _mirror.style.left = x + 'px';
        _mirror.style.top = y + 'px';

        var item = _copy || _item;
        var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
        var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
        var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
        if (changed || dropTarget === null) {
          out();
          _lastDropTarget = dropTarget;
          over();
        }
        var parent = getParent(item);
        if (dropTarget === _source && _copy && !o.copySortSource) {
          if (parent) {
            parent.removeChild(item);
          }
          return;
        }
        var reference;
        var immediate = getImmediateChild(dropTarget, elementBehindCursor);
        if (immediate !== null) {
          reference = getReference(dropTarget, immediate, clientX, clientY);
        } else if (o.revertOnSpill === true && !_copy) {
          reference = _initialSibling;
          dropTarget = _source;
        } else {
          if (_copy && parent) {
            parent.removeChild(item);
          }
          return;
        }
        if (
          (reference === null && changed) ||
          reference !== item &&
          reference !== nextEl(item)
        ) {
          _currentSibling = reference;
          dropTarget.insertBefore(item, reference);
          drake.emit('shadow', item, dropTarget, _source);
        }
        function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
        function over () { if (changed) { moved('over'); } }
        function out () { if (_lastDropTarget) { moved('out'); } }
      }

      function spillOver (el) {
        classes.rm(el, 'gu-hide');
      }

      function spillOut (el) {
        if (drake.dragging) { classes.add(el, 'gu-hide'); }
      }

      function renderMirrorImage () {
        if (_mirror) {
          return;
        }
        var rect = _item.getBoundingClientRect();
        _mirror = _item.cloneNode(true);
        _mirror.style.width = getRectWidth(rect) + 'px';
        _mirror.style.height = getRectHeight(rect) + 'px';
        classes.rm(_mirror, 'gu-transit');
        classes.add(_mirror, 'gu-mirror');
        o.mirrorContainer.appendChild(_mirror);
        touchy(documentElement, 'add', 'mousemove', drag);
        classes.add(o.mirrorContainer, 'gu-unselectable');
        drake.emit('cloned', _mirror, _item, 'mirror');
      }

      function removeMirrorImage () {
        if (_mirror) {
          classes.rm(o.mirrorContainer, 'gu-unselectable');
          touchy(documentElement, 'remove', 'mousemove', drag);
          getParent(_mirror).removeChild(_mirror);
          _mirror = null;
        }
      }

      function getImmediateChild (dropTarget, target) {
        var immediate = target;
        while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
          immediate = getParent(immediate);
        }
        if (immediate === documentElement) {
          return null;
        }
        return immediate;
      }

      function getReference (dropTarget, target, x, y) {
        var horizontal = o.direction === 'horizontal';
        var reference = target !== dropTarget ? inside() : outside();
        return reference;

        function outside () { // slower, but able to figure out any position
          var len = dropTarget.children.length;
          var i;
          var el;
          var rect;
          for (i = 0; i < len; i++) {
            el = dropTarget.children[i];
            //rect = el.getBoundingClientRect();
            rect = geom.boundingRect(el);
            if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
            if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
          }
          return null;
        }

        function inside () { // faster, but only available if dropped inside a child element
          
          //var rect = target.getBoundingClientRect();
          var  rect = geom.boundingRect(target);
          if (horizontal) {
            return resolve(x > rect.left + getRectWidth(rect) / 2);
          }
          return resolve(y > rect.top + getRectHeight(rect) / 2);
          
        }

        function resolve (after) {
          return after ? nextEl(target) : target;
        }
      }

      function isCopy (item, container) {
        return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
      }
    }


    
    function touchy (el, op, type, fn) {
      /*
      var touch = {
        mouseup: 'touchend',
        mousedown: 'touchstart',
        mousemove: 'touchmove'
      };
      var pointers = {
        mouseup: 'pointerup',
        mousedown: 'pointerdown',
        mousemove: 'pointermove'
      };
      var microsoft = {
        mouseup: 'MSPointerUp',
        mousedown: 'MSPointerDown',
        mousemove: 'MSPointerMove'
      };
      if (global.navigator.pointerEnabled) {
        crossvent[op](el, pointers[type], fn);
      } else if (global.navigator.msPointerEnabled) {
        crossvent[op](el, microsoft[type], fn);
      } else {
        crossvent[op](el, touch[type], fn);
        crossvent[op](el, type, fn);
      }
      */
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

    function getOffset (el) {
      /*
      var rect = el.getBoundingClientRect();
      return {
        left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
        top: rect.top + getScroll('scrollTop', 'pageYOffset')
      };
      */
      return geom.pagePosition(el);
    }

    /*
    function getScroll (scrollProp, offsetProp) {
      if (typeof global[offsetProp] !== 'undefined') {
        return global[offsetProp];
      }
      if (documentElement.clientHeight) {
        return documentElement[scrollProp];
      }
      return doc.body[scrollProp];
    }
    */

    function getElementBehindPoint (point, x, y) {
      var p = point || {};
      var state = p.className;
      var el;
      p.className += ' gu-hide';
      el = doc.elementFromPoint(x, y);
      p.className = state;
      return el;
    }

    function never () { 
      return false; 
    }
    function always () { 
      return true; 
    }
    function getRectWidth (rect) { 
      return rect.width || (rect.right - rect.left); 
    }
    function getRectHeight (rect) { 
      return rect.height || (rect.bottom - rect.top); 
    }
    function getParent (el) { 
      //return el.parentNode === doc ? null : el.parentNode; 
      return finder.parent(el);
    }
    function isInput (el) {
      // return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); 
      return noder.isInput(el);
   }
    
    
    function isEditable (el) {
      /*
      if (!el) { return false; } // no parents were editable
      if (el.contentEditable === 'false') { return false; } // stop the lookup
      if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
      return isEditable(getParent(el)); // contentEditable is set to 'inherit'
      */
      return noder.isEditable(el);
    }
    

    function nextEl (el) {
      /*
      return el.nextElementSibling || manually();
      function manually () {
        var sibling = el;
        do {
          sibling = sibling.nextSibling;
        } while (sibling && sibling.nodeType !== 1);
        return sibling;
      }
      */
      return finder.nextSibling(el);
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
