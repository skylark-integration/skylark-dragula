define([
  "skylark-langx/skylark",
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

    var documentElement = noder.root(); 	


	function listen(drake,options) {

		var _offsetX; // reference x
	    var _offsetY; // reference y
	    var _moveX; // reference move x
	    var _moveY; // reference move y
		
	    var _grabbed; // holds mousedown context until first mousemove


		var _mirror; // mirror image

		function renderMirrorImage () {
			if (_mirror) {
			  return;
			}
			var rect = drake._item.getBoundingClientRect();
			_mirror = drake._item.cloneNode(true);
			_mirror.style.width = helpers.getRectWidth(rect) + 'px';
			_mirror.style.height = helpers.getRectHeight(rect) + 'px';
			styler.removeClass(_mirror, 'gu-transit');
			styler.addClass(_mirror, 'gu-mirror');
			options.mirrorContainer.appendChild(_mirror);
			helpers.touchy(documentElement, 'add', 'mousemove', drag);
			styler.addClass(options.mirrorContainer, 'gu-unselectable');
			drake.emit('cloned', _mirror, drake._item, 'mirror');
		}

		function removeMirrorImage () {
			if (_mirror) {
			  styler.removeClass(options.mirrorContainer, 'gu-unselectable');
			  helpers.touchy(documentElement, 'remove', 'mousemove', drag);
			  finder.parent(_mirror).removeChild(_mirror);
			  _mirror = null;
			}
		}

		function moveMirrorImage(x,y) {
			_mirror.style.left = x + 'px';
			_mirror.style.top = y + 'px';
		}

		function isMirrorRendered() {
		  	return !!_mirror;
		}

		function preventGrabbed (e) {
			if (_grabbed) {
			  e.preventDefault();
			}
		}

		function events (remove) {
			var op = remove ? 'remove' : 'add';
			helpers.touchy(documentElement, op, 'mousedown', grab);
			helpers.touchy(documentElement, op, 'mouseup', release);
		}

		function eventualMovements (remove) {
			var op = remove ? 'remove' : 'add';
			helpers.touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
		}


		function movements (remove) {
			var op = remove ? 'off' : 'on';
			eventer[op](documentElement, 'selectstart', preventGrabbed); // IE8
			eventer[op](documentElement, 'click', preventGrabbed);
		} 

		function grab (e) {
			_moveX = e.clientX;
			_moveY = e.clientY;

			var ignore = helpers.whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
			if (ignore) {
			  return; // we only care about honest-to-god left clicks and touch events
			}
			var item = e.target;
			var context = drake.canStart(item);
			if (!context) {
		  		return;
			}
			_grabbed = context;
			eventualMovements();
			if (e.type === 'mousedown') {
		  		if (noder.isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
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
			if (helpers.whichMouseButton(e) === 0) {
		  		release({});
		  		return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
			}
			// truthy check fixes #239, equality fixes #207
			if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
				return;
			}

			var grabbed = _grabbed; // call to end() unsets _grabbed
			eventualMovements(true);
			movements();
			drake.end();
			drake.start(grabbed);

			var offset = geom.pagePosition(drake._item);
			_offsetX = helpers.getCoord('pageX', e) - offset.left;
			_offsetY = helpers.getCoord('pageY', e) - offset.top;

			styler.addClass(drake._copy || drake._item, 'gu-transit');
			renderMirrorImage();
			drag(e);
		}

		function ungrab () {
			_grabbed = false;
			eventualMovements(true);
			movements(true);
		}

		function release (e) {
			ungrab();
            removeMirrorImage();
			if (!drake.dragging) {
			  return;
			}
			var item = drake._copy || drake._item;
			var clientX = helpers.getCoord('clientX', e);
			var clientY = helpers.getCoord('clientY', e);
			var dropTarget = drake.findDropTarget(clientX, clientY);
			if (dropTarget && ((drake._copy &&  options.copySortSource) || (!drake._copy || dropTarget !== drake._source))) {
			  drake.drop(item, dropTarget);
			} else if (options.removeOnSpill) {
			  drake.remove();
			} else {
			  drake.cancel();
			}
		}

		function drag (e) {
			if (!isMirrorRendered()) {
			  return;
			}
			e.preventDefault();

			var clientX = helpers.getCoord('clientX', e);
			var clientY = helpers.getCoord('clientY', e);


			moveMirrorImage(clientX - _offsetX,clientY - _offsetY);

			drake.over(clientX,clientY);
		}

		return {
			events,
			grab,
			ungrab,
			release
		}
	}

	return listen;
});