define([
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