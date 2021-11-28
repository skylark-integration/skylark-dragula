
function initPage($,dragula) {

  'use strict';


  var sortable = elm('sortable');

  dragula([elm('left-defaults'), elm('right-defaults')]);
  dragula([elm('left-copy'), elm('right-copy')], { copy: true });
  dragula([elm('left-events'), elm('right-events')])
    .on('drag', function (el) {
      el.className = el.className.replace('ex-moved', '');
    })
    .on('drop', function (el) {
      el.className += ' ex-moved';
    })
    .on('over', function (el, container) {
      container.className += ' ex-over';
    })
    .on('out', function (el, container) {
      container.className = container.className.replace('ex-over', '');
    });
  dragula([elm('left-rollbacks'), elm('right-rollbacks')], { revertOnSpill: true });
  dragula([elm('left-lovehandles'), elm('right-lovehandles')], {
    moves: function (el, container, handle) {
      return handle.classList.contains('handle');
    }
  });

  dragula([elm('left-rm-spill'), elm('right-rm-spill')], { removeOnSpill: true });
  dragula([elm('left-copy-1tomany'), elm('right-copy-1tomany')], {
    copy: function (el, source) {
      return source === elm('left-copy-1tomany');
    },
    accepts: function (el, target) {
      return target !== elm('left-copy-1tomany');
    }
  });

  dragula([sortable]);

  $(sortable).on('click', clickHandler);

  function clickHandler (e) {
    var target = e.target;
    if (target === sortable) {
      return;
    }
    target.innerHTML += ' [click!]';

    setTimeout(function () {
      target.innerHTML = target.innerHTML.replace(/ \[click!\]/g, '');
    }, 500);
  }

  function elm (id) {
    return document.getElementById(id);
  }

}
