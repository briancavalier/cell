(function () {
'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Updated = function () {
  function Updated(updated, value) {
    classCallCheck(this, Updated);

    this.updated = updated;
    this.value = value;
  }

  createClass(Updated, [{
    key: 'merge',
    value: function merge(_merge, a) {
      return _merge(this.value, a);
    }
  }, {
    key: 'propagate',
    value: function propagate(l) {
      l(this.value);
    }
  }, {
    key: 'satisfies',
    value: function satisfies(p) {
      return p(this.value);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'updated: ' + String(this.updated) + ', value: ' + String(this.value);
    }
  }]);
  return Updated;
}();

var Conflict = function () {
  function Conflict() {
    classCallCheck(this, Conflict);

    this.updated = false;
    this.value = undefined;
  }

  createClass(Conflict, [{
    key: 'merge',
    value: function merge(_merge2, a) {
      return this;
    }
  }, {
    key: 'propagate',
    value: function propagate(ls) {}
  }, {
    key: 'satisfies',
    value: function satisfies(p) {
      return false;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<conflict>';
    }
  }]);
  return Conflict;
}();

var None = function () {
  function None() {
    classCallCheck(this, None);

    this.updated = false;
    this.value = undefined;
  }

  createClass(None, [{
    key: 'merge',
    value: function merge(_merge3, a) {
      return updated(a);
    }
  }, {
    key: 'propagate',
    value: function propagate(ls) {}
  }, {
    key: 'satisfies',
    value: function satisfies(p) {
      return false;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<none>';
    }
  }]);
  return None;
}();

var none = function none() {
  return new None();
};

var unchanged = function unchanged(value) {
  return new Updated(false, value);
};
var updated = function updated(value) {
  return new Updated(true, value);
};

// A cell holds a value and a merge strategy for updating the value
// with additional information
var Cell = function () {
  function Cell(merge, update) {
    classCallCheck(this, Cell);

    this.merge = merge;
    this.update = update;
    this.listeners = [];
  }

  createClass(Cell, [{
    key: 'inspect',
    value: function inspect() {
      return 'Cell { ' + String(this.update) + ' }';
    }
  }]);
  return Cell;
}();

// A default merge strategy that uses === comparison.
var defaultMerge = function defaultMerge(o, n) {
  return o === n ? unchanged(o) : updated(n);
};

// Create an empty cell with the provided merge strategy
var emptyCell = function emptyCell() {
  var merge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMerge;
  return new Cell(merge, none());
};

// Create a cell containing an initial value, and which uses the provided merge strategy
var cell = function cell(a) {
  var merge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultMerge;
  return new Cell(merge, unchanged(a));
};

// Write a new value into the cell, using the cell's merge strategy
// and propagating any updates to readers
var write = function write(a, cell) {
  var merge = cell.merge,
      update = cell.update,
      listeners = cell.listeners;

  var merged = update == null ? updated(a) : update.merge(merge, a);

  cell.update = merged;
  if (merged.updated === true) {
    listeners.forEach(function (l) {
      return merged.propagate(l);
    });
  }
};

// Attempt to read the cell's value, waiting until the value reaches
// the state represented by the threshold predicate


// Listen for updated values in the cell
var listen = function listen(l, cell) {
  cell.listeners.push(l);
  cell.update.propagate(l);
  return function () {
    cell.listeners = cell.listeners.filter(function (x) {
      return x !== l;
    });
  };
};

// Connect two cells, making cb's value dependent on ca's value.  When ca
// is updated, it's value will be transformed by f and then written
// to cb (obeying cb's merge strategy)
var connect = function connect(f, ca, cb) {
  return listen(function (a) {
    return write(f(a), cb);
  }, ca);
};

// DOM helpers
var fail = function fail(message) {
  throw new Error(message);
};
var qs = function qs(selector) {
  return document.querySelector(selector) || fail(selector + ' not found');
};

// Connect a DOM input to a cell in *both* directions:
// - when the input changes, update the cell
// - when the cell changes, update the input
var connectInput = function connectInput(cell, input) {
  input.addEventListener('input', function (e) {
    var value = Number(e.target.value);
    if (isNaN(value)) {
      return;
    }
    write(value, cell);
  });
  listen(function (x) {
    input.value = String(x);
  }, cell);
};

// A reasonable merge strategy for floats that indicates a value
// has changed when it has moved by more than an epsilon value.
var mergeFloat = function mergeFloat(f1, f2) {
  return Math.abs(f1 - f2) < 0.01 ? unchanged(f1) : updated(f2);
};

// Create cells to hold temperature values in various units
// Initialize celsius to 0.  The starting values of the other
// cells will be derived from celsius when they are connected below.
var celsius = cell(0, mergeFloat);
var fahrenheit = emptyCell(mergeFloat);
var kelvin = emptyCell(mergeFloat);

// Temperature conversion functions
// These could be generated by a constraint solver, for example
var c2f = function c2f(c) {
  return c * 9.0 / 5.0 + 32;
};
var f2c = function f2c(f) {
  return (f - 32) * (5.0 / 9.0);
};
var c2k = function c2k(c) {
  return c + 273.15;
};
var k2c = function k2c(k) {
  return k - 273.15;
};
var k2f = function k2f(k) {
  return c2f(k2c(k));
};
var f2k = function f2k(f) {
  return c2k(f2c(f));
};

// Setup relationships between temperature cells, such that
// whenever one changes, the others are updated.
// Obviously, this creates a cyclic graph.  That's not
// a problem because Cells use a merge strategy that
// only propagates updates when they are "meaningful", that is,
// they added new information (as defined by the merge
// strategy) to the cell's value.
// These cells are using the default merge strategy which just
// uses `===` to determine if an update is meaningful or not.
connect(c2f, celsius, fahrenheit);
connect(c2k, celsius, kelvin);
connect(f2c, fahrenheit, celsius);
connect(f2k, fahrenheit, kelvin);
connect(k2c, kelvin, celsius);
connect(k2f, kelvin, fahrenheit);

// Get the DOM input elements
var celsiusInput = qs('[name=celsius]');
var fahrenheitInput = qs('[name=fahrenheit]');
var kelvinInput = qs('[name=kelvin]');

// Connect cells to DOM input elements
connectInput(celsius, celsiusInput);
connectInput(fahrenheit, fahrenheitInput);
connectInput(kelvin, kelvinInput);

}());
