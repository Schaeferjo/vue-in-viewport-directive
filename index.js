// Generated by CoffeeScript 2.3.2
// Deps
var addListeners, counter, directive, disabled, isNumeric, monitors, objIsSame, offset, removeListeners, update;

import scrollMonitor from 'scrollmonitor';

// A dictionary for storing data per-element
counter = 0;

monitors = {};

// Support toggling of disabled state
disabled = false;

export var disable = function () {
  return disabled = true;
};

export var enable = function () {
  var id, monitor, results;
  disabled = false;
  results = [];
  for (id in monitors) {
    monitor = monitors[id];
    results.push(update(monitor));
  }
  return results;
};

// Create scrollMonitor after the element has been added to DOM
addListeners = function (el, binding) {
  var id, monitor;
  // Create and generate a unique id that will be store in a data value on
  // the element
  monitor = {
    el: el,
    modifiers: binding.modifiers,
    watcher: scrollMonitor.create(el, offset(binding.value))
  };
  id = 'i' + counter++;
  el.setAttribute('data-in-viewport', id);
  monitors[id] = monitor;
  // Start listenting for changes
  monitor.watcher.on('stateChange', function () {
    return update(monitor);
  });
  if (!disabled) {
    // Update intiial state, which also handles `once` prop
    return update(monitor);
  }
};

// Parse the binding value into scrollMonitor offsets
offset = function (value) {
  if (isNumeric(value)) {
    return {
      top: value,
      bottom: value
    };
  } else {
    return {
      top: (value != null ? value.top : void 0) || directive.defaults.top,
      bottom: (value != null ? value.bottom : void 0) || directive.defaults.bottom
    };
  }
};

// Test if var is a number
isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

// Update element classes based on current scrollMonitor state
update = function ({ el, watcher, modifiers }) {
  var add, remove, toggle;
  if (disabled) {
    return;
  }
  // Init vars
  add = []; // Classes to add
  remove = []; // Classes to remove

  // Util to DRY up population of add and remove arrays
  toggle = function (bool, klass) {
    if (bool) {
      return add.push(klass);
    } else {
      return remove.push(klass);
    }
  };
  // Determine which classes to add
  toggle(watcher.isInViewport, 'in-viewport');
  toggle(watcher.isFullyInViewport, 'fully-in-viewport');
  toggle(watcher.isAboveViewport, 'above-viewport');
  toggle(watcher.isBelowViewport, 'below-viewport');
  if (add.length) {
    // Apply classes to element
    el.classList.add.apply(el.classList, add);
  }
  if (remove.length) {
    el.classList.remove.apply(el.classList, remove);
  }
  if (modifiers.once && watcher.isInViewport) {
    // If set to update "once", remove listeners if in viewport
    return removeListeners(el);
  }
};

// Compare two objects.  Doing JSON.stringify to conpare as a quick way to
// deep compare objects
objIsSame = function (obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

// Remove scrollMonitor listeners
removeListeners = function (el) {
  var id, monitor, ref;
  id = el.getAttribute('data-in-viewport');
  if (monitor = monitors[id]) {
    if ((ref = monitor.watcher) != null) {
      ref.destroy();
    }
    return delete monitors[id];
  }
};

// Mixin definition
export default directive = {
  // Define overrideable defaults
  defaults: {
    top: 0,
    bottom: 0
  },
  // Init
  inserted: function (el, binding) {
    return addListeners(el, binding);
  },
  // If the value changed, re-init scrollbar since scrollMonitor doesn't provide
  // an API to update the offsets.
  componentUpdated: function (el, binding) {
    if (objIsSame(binding.value, binding.oldValue)) {
      return;
    }
    removeListeners(el);
    return addListeners(el, binding);
  },
  // Cleanup
  unbind: function (el) {
    return removeListeners(el);
  }
};