// Model implementation of SelectorObserver.
//
// This should serve as a model of correctness for guiding the implemenation
// of "selector-observer.js". Tests should pass on both implemenations.
// Prefer easy to understand code over any sort of efficiency. No
// optimizations.
//
(function(window) {
  'use strict';

  var Promise = window.Promise;
  var WeakMap = window.WeakMap;
  var slice = Array.prototype.slice;
  var bind = function(fn, self) {
    return function() {
      return fn.apply(self, arguments);
    };
  };

  function Deferred() {
    this.resolved = null;
    this.pending = [];
  }

  Deferred.prototype.resolve = function() {
    if (!this.resolved) {
      this.resolved = Promise.cast();
      var p = this.pending.length;
      while (p--) {
        this.resolved.then(this.pending[p]);
      }
    }
  };

  Deferred.prototype.then = function(onFulfilled) {
    if (this.resolved) {
      this.resolved.then(onFulfilled);
    } else {
      this.pending.push(onFulfilled);
    }
  };


  var uid = 0;

  function SelectorObserver(root) {
    this.root = root;
    this.observers = [];
    this.trackedElements = [];
    this.handlers = new WeakMap();

    this.scheduleCheckForChanges = bind(this.scheduleCheckForChanges, this);
    this.checkForChanges = bind(this.checkForChanges, this);

    this.scheduleCheckForChangesId = setInterval(this.scheduleCheckForChanges, 0);
  }

  SelectorObserver.prototype.disconnect = function() {
    clearInterval(this.scheduleCheckForChangesId);
    clearInterval(this.checkForChangesId);
  };

  SelectorObserver.prototype.observe = function(selector, handler) {
    this.observers.push({
      id: ++uid,
      selector: selector,
      handler: handler
    });
  };

  SelectorObserver.prototype.scheduleCheckForChanges = function() {
    if (typeof this.checkForChangesId !== 'number') {
      this.checkForChangesId = setTimeout(this.checkForChanges, 0);
    }
  };

  SelectorObserver.prototype.checkForChanges = function() {
    var elements = slice.call(this.root.getElementsByTagName('*'), 0);
    elements = elements.concat(this.trackedElements);

    function runHandler(handler, el, deferred) {
      Promise.cast().then(function() {
        var result = handler.call(el, el);
        if (typeof result === 'function') {
          deferred.then(function() {
            result.call(el, el);
          });
        }
      });
    }

    var i;
    for (i = 0; i < this.observers.length; i++) {
      var observer = this.observers[i];
      var observerKey = '__selectorObserver' + observer.id;
      var matches = slice.call(this.root.querySelectorAll(observer.selector), 0);

      var e;
      for (e = 0; e < elements.length; e++) {
        var el = elements[e];

        if (matches.indexOf(el) !== -1) {
          if (!el[observerKey]) {
            var deferred = new Deferred();
            el[observerKey] = deferred;
            this.trackedElements.push(el);
            runHandler(observer.handler, el, deferred);
          }
        } else {
          if (el[observerKey]) {
            el[observerKey].resolve();
            delete el[observerKey];
          }
        }
      }
    }

    this.checkForChangesId = null;
  };


  window.SelectorObserver = SelectorObserver;
})(this);
