(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Types = exports.typeful = exports.override = void 0;

var _any = _interopRequireDefault(require("./types/any"));

var _enum = _interopRequireDefault(require("./types/enum"));

var _union = _interopRequireDefault(require("./types/union"));

var _except = _interopRequireDefault(require("./types/except"));

var _array = _interopRequireDefault(require("./types/array"));

var _duck = _interopRequireDefault(require("./types/duck"));

var _required = _interopRequireDefault(require("./types/required"));

var _default = _interopRequireDefault(require("./types/default"));

var _endless = _interopRequireDefault(require("./types/endless"));

var _type = _interopRequireDefault(require("./types/type"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var override = function override(list) {
  // Check the arguments.
  if (!Array.isArray(list)) throw new Error("The argument is not an array!");
  var functions = list.map(function (func, index) {
    if (!(func instanceof Function)) throw new Error("That's not a exact function at " + index);

    if (!func.typeful_tag) {
      // Package it as a function, which the parameters are all typeness.
      var params = [];

      for (var i = 0; i < func.length; ++i) {
        params.push(Types.Any);
      }

      return typeful(params, func);
    } else return func;
  }); // .reduce((list, func) => {
  //   // Compare func.parameters and each n.parameters in the list.
  //   let repeat = true;
  //   console.log("Now the func is", func.parameters);
  //   list.forEach(n => {
  //     console.log("Comparing", n.parameters);
  //     if (!repeat) return;
  //     let length = func.parameters.length;
  //     if (length !== n.parameters.length) {
  //       repeat = false;
  //       return;
  //     }
  //     for (let i = 0; i < length; ++i) {
  //       if (func.parameters[i] instanceof Type) {
  //         if (n.parameters[i] instanceof Type) repeat = func.parameters[i].equals(n.parameters[i]);
  //         else repeat = false;
  //       } else {
  //         if ((typeof func.parameters[i]) !== (typeof n.parameters[i])) repeat = false;
  //       }
  //     }
  //   });
  //   console.log("List: ", list);
  //   if (list.length > 0 && repeat) throw new Error("Repeatical parameters!");
  //   list.push(func);
  //   return list;
  // }, []);
  // Create the middle-ware function.

  return function () {
    var args = Array.prototype.slice.call(arguments); // Pick candidate function.

    var candidated = functions.filter(function (f) {
      var pos = 0,
          flag = args.map(function () {
        return false;
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = f.parameters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var param = _step.value;

          if (!(param instanceof _type.default)) {
            if (args[pos] && args[pos].__proto__.constructor === param) return true;else return false;
          }

          switch (param.name) {
            case "enum":
            case "union":
            case "except":
            case "array":
            case "duck":
            case "any":
              if (!args[pos]) return false;
              if (!param.match(args[pos])) return false;
              flag[pos++] = true;
              break;

            case "required":
              if (args[pos] && param.match(args[pos])) flag[pos++] = true;
              break;

            case "default":
              if (args[pos] && param.match(args[pos])) flag[pos++] = true;else {
                flag[pos++] = true;
                args = args.slice(0, pos).concat([param.value]).concat(args.slice(pos));
              }
              break;

            case "endless":
              while (args[pos] && param.match(args[pos])) {
                flag[pos++] = true;
              }

              break;

            default:
              throw new Error("Unknown type: " + param.name);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      flag = flag.length > 0 ? flag.reduce(function (prev, next) {
        return prev && next;
      }) : true;
      return flag;
    }); // .reduce((prev, next) => {
    //   let next_weight = next.parameters.map(param => param.weight());
    //   if(next_weight.length > 0) next_weight = next_weight.reduce((prev, next) => prev + next);
    //   else next_weight = 0;
    //   let next_depth = next.parameters.map(param => param.depth());
    //   if(next_depth.length > 0) next_depth = next_depth.reduce((prev, next) => prev > next ? prev : next);
    //   else next_depth = 0;
    //   let next_obj = {
    //     func: next,
    //     weight: next_weight,
    //     depth: next_depth
    //   }
    //   if (prev.func.level && next.level) {
    //     if (prev.func.level > next.level) return prev;
    //     else if (prev.func.level < next.level) return next_obj;
    //     else throw new Error("Cannot have the same level override!");
    //   }
    //   else if (prev.func.level) return prev;
    //   else if (next.level) return next_obj;
    //   if (prev.weight > next.weight) return prev;
    //   else if (prev.depth > next_depth) return next_obj;
    //   else throw new Error(
    //     "Cannot parse these arguments to the exact function: ("
    //     + args.reduce((prev, next) => prev + ", " + next, "")
    //     + ")");
    // }, { func: null, weight: 0, depth: Infinity }).func;

    if (candidated.length > 1) throw new Error("It is not supported to filter the optimal function from multiple candidate functions.");
    if (candidated.length < 1) throw new Error("No match!");
    return candidated[0].apply(this, args);
  };
}; // TODO: typeful 改成 strongly


exports.override = override;

var typeful = function typeful(params, func, level) {
  func.typeful_tag = true; // Check the parameter.

  if (!Array.isArray(params)) throw new Error("You should provide an array as the parameter list!");
  if (typeof func !== 'function') throw new Error("You should provide an extra function!");
  if (level && typeof level !== 'number') throw new Error("You should provide a number as the level!");

  var transform_array = function transform_array(arr) {
    if (!Array.isArray(arr)) throw new Error("Is that an array?!"); // Let each element be converted.

    var map_arr = function map_arr(n) {
      if (Array.isArray(n)) return transform_array(n);else if (_typeof(n) === 'object') return transform_object(n);else return n;
    };

    arr = arr.map(map_arr);

    if (arr.length > 1) {
      if (arr[0] === "!") {
        // Except
        return new _except.default(arr.slice(1).map(map_arr));
      } else if (arr[0] === "?") {
        // Required
        if (arr.length > 2) {
          // Required + ?
          if (arr[1] === "!") {
            // Required + Except
            return new _required.default(new _except.default(arr.slice(2)));
          } else {
            // Required + Union
            return new _required.default(new _union.default(arr.slice(1)));
          }
        } else return new _required.default(arr[1]);
      } else if (arr[0] === "?=") {
        // Default
        if (arr.length > 3) {
          if (arr[2] === "!") {
            // Default + Except
            return new _default.default(new _except.default(arr.slice(3)), arr[1]);
          } else {
            // Default + Union
            return new _default.default(new _union.default(arr.slice(2)), arr[1]);
          }
        } else return new _default.default(arr[2], arr[1]);
      } else if (arr[0] === "*") {
        // Endless
        if (arr.length > 2) {
          // Endless + ?
          if (arr[1] === "!") {
            // Endless + Except
            return new _endless.default(new _except.default(arr.slice(2)));
          } else {
            // Endless + Union
            return new _endless.default(new _union.default(arr.slice(1)));
          }
        } else return new _endless.default(arr[1]);
      } else if (_typeof(arr[0]) !== 'object' && typeof arr[0] !== 'function') {
        // Enum

        /*
          Notice:
          As well known to all, everything in JavaScript is object, so we don't know what exact class an object is.
          You could only use the build-in  types to create the enum type by using an array,
          otherwise you should use "Types.Enum(...)" to create it.
        */
        return new _enum.default(arr);
      } else {
        // Union
        return new _union.default(arr.map(map_arr));
      }
    } else {
      // Normal array requires a single type.
      return new _array.default(arr[0]);
    }
  };

  var transform_object = function transform_object(obj) {
    for (var _i = 0, _Object$keys = Object.keys(obj); _i < _Object$keys.length; _i++) {
      var i = _Object$keys[_i];
      if (Array.isArray(obj[i])) obj[i] = transform_array(obj[i]);else if (!(obj[i] instanceof _type.default) && _typeof(obj[i]) === 'object') obj[i] = transform_object(obj[i]);
    }

    return new _duck.default(obj);
  }; // Verify the parameter.


  func.parameters = params.map(function (n) {
    if (Array.isArray(n)) return transform_array(n);else if (!(n instanceof _type.default) && _typeof(n) === 'object') return transform_object(n);else return n;
  });
  func.level = level;
  return func;
};

exports.typeful = typeful;
var Types = {
  Any: new _any.default(),
  Enum: function Enum(values) {
    return new _enum.default(values);
  },
  Union: function Union(types) {
    return new _union.default(types);
  },
  Except: function Except(types) {
    return new _except.default(types);
  },
  Array: function Array(type) {
    return new _array.default(type);
  },
  Duck: function Duck(obj) {
    return new _duck.default(obj);
  },
  Required: function Required(type) {
    return new _required.default(type);
  },
  Default: function Default(type, value) {
    return new _default.default(type, value);
  },
  Endless: function Endless(type) {
    return new _endless.default(type);
  }
};
exports.Types = Types;

},{"./types/any":2,"./types/array":3,"./types/default":4,"./types/duck":5,"./types/endless":6,"./types/enum":7,"./types/except":8,"./types/required":9,"./types/type":10,"./types/union":11}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Any =
/*#__PURE__*/
function (_Type) {
  _inherits(Any, _Type);

  function Any() {
    _classCallCheck(this, Any);

    return _possibleConstructorReturn(this, _getPrototypeOf(Any).call(this, "any"));
  }

  _createClass(Any, [{
    key: "equals",
    value: function equals(n) {
      return n.name === this.name;
    }
  }, {
    key: "match",
    value: function match(n) {
      return true;
    }
  }, {
    key: "weight",
    value: function weight() {
      return _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1;
    }
  }]);

  return Any;
}(_type.default);

exports.default = Any;

},{"../weight":12,"./type":10}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Array_ =
/*#__PURE__*/
function (_Type) {
  _inherits(Array_, _Type);

  function Array_(type) {
    var _this;

    _classCallCheck(this, Array_);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Array_).call(this, "array"));
    _this.type = type;
    return _this;
  }

  _createClass(Array_, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      if (this.type instanceof _type.default) return this.type.equals(n.type);else return this.type === n.type;
    }
  }, {
    key: "match",
    value: function match(n) {
      if (!Array.isArray(n)) return false;

      if (this.type instanceof _type.default) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = n[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var i = _step.value;
            if (!this.type.match(i)) return false;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      } else {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = n[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _i = _step2.value;
            if (_i.__proto__.constructor !== this.type) return false;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      return true;
    }
  }, {
    key: "weight",
    value: function weight() {
      return this.type instanceof _type.default ? this.type.weight() : _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1 + (this.type instanceof _type.default) ? this.type.depth() : 1;
    }
  }]);

  return Array_;
}(_type.default);

exports.default = Array_;

},{"../weight":12,"./type":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Default =
/*#__PURE__*/
function (_Type) {
  _inherits(Default, _Type);

  function Default(type) {
    var _this;

    _classCallCheck(this, Default);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Default).call(this, "default"));
    _this.type = type;
    return _this;
  }

  _createClass(Default, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      if (this.type instanceof _type.default) return this.type.equals(n.type);else return this.type === n.type;
    }
  }, {
    key: "match",
    value: function match(n) {
      if (this.type instanceof _type.default) return this.type.match(n);else return n.__proto__.constructor === this.type;
    }
  }, {
    key: "weight",
    value: function weight() {
      return _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1 + (this.type instanceof _type.default) ? this.type.depth() : 0;
    }
  }]);

  return Default;
}(_type.default);

exports.default = Default;

},{"../weight":12,"./type":10}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

var _required = _interopRequireDefault(require("./required"));

var _default = _interopRequireDefault(require("./default"));

var _endless = _interopRequireDefault(require("./endless"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Duck =
/*#__PURE__*/
function (_Type) {
  _inherits(Duck, _Type);

  function Duck(obj) {
    var _this;

    _classCallCheck(this, Duck);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Duck).call(this, "duck")); // Check the object.

    var dfs = function dfs(n) {
      for (var _i = 0, _Object$keys = Object.keys(n); _i < _Object$keys.length; _i++) {
        var i = _Object$keys[_i];

        if (!(n[i] instanceof _type.default || ['function', 'object'].indexOf(_typeof(n[i])) !== -1)) {
          throw new Error("You cannot use the build-in values to be the class type!");
        }

        if (_typeof(n[i]) === 'object') dfs(i);
      }
    };

    if (_typeof(obj) !== 'object') throw new Error("You cannot use the build-in values to be the class type!");
    dfs(obj);
    _this.template = obj;
    return _this;
  }

  _createClass(Duck, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;

      var dfs = function dfs(left, right) {
        var leftKeys = Object.keys(left).sort(),
            rightKeys = Object.keys(right).sort();
        if (leftKeys.length !== rightKeys.length) return false;

        for (var i = 0, length = leftKeys.length; i < length; ++i) {
          if (leftKeys[i] !== rightKeys[i]) return false;

          if (_typeof(left[leftKeys[i]]) == 'object' && _typeof(right[rightKeys[i]]) == 'object') {
            if (!dfs(left[leftKeys[i]], right[rightKeys[i]])) return false;
          } else {
            if (left[leftKeys[i]] !== right[rightKeys[i]]) return false;
          }
        }

        return true;
      };

      return dfs(this.template, n.template);
    }
  }, {
    key: "match",
    value: function match(n) {
      var dfs = function dfs(t, obj) {
        var objKeys = Object.keys(obj).sort(),
            tKeys = Object.keys(t).sort();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = tKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var i = _step.value;

            if (objKeys.indexOf(i) < 0) {
              var type = t[i];
              if (type instanceof _required.default) continue;
              if (type instanceof _default.default) continue;
              if (type instanceof _endless.default) continue; // This duck object must has this key, so it verfies failure.

              return false;
            }

            if (t[i] instanceof _type.default && !t[i].match(obj[i])) return false;else if (_typeof(t[i]) === 'object' && !dfs(t[i], obj[i])) return false;else if (obj[i].__proto__.constructor !== t[i]) return false;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return true;
      };

      return dfs(this.template, n);
    }
  }, {
    key: "weight",
    value: function weight() {
      return _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1;
    }
  }]);

  return Duck;
}(_type.default);

exports.default = Duck;

},{"../weight":12,"./default":4,"./endless":6,"./required":9,"./type":10}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Endless =
/*#__PURE__*/
function (_Type) {
  _inherits(Endless, _Type);

  function Endless(type) {
    var _this;

    _classCallCheck(this, Endless);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Endless).call(this, "endless"));
    _this.type = type;
    return _this;
  }

  _createClass(Endless, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      if (this.type instanceof _type.default) return this.type.equals(n.type);else return this.type === n.type;
    }
  }, {
    key: "match",
    value: function match(n) {
      if (this.type instanceof _type.default) return this.type.match(n);else return n.__proto__.constructor === this.type;
    }
  }, {
    key: "weight",
    value: function weight() {
      return _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1 + (this.type instanceof _type.default) ? this.type.depth() : 0;
    }
  }]);

  return Endless;
}(_type.default);

exports.default = Endless;

},{"../weight":12,"./type":10}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Enum =
/*#__PURE__*/
function (_Type) {
  _inherits(Enum, _Type);

  function Enum(values) {
    var _this;

    _classCallCheck(this, Enum);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Enum).call(this, "enum"));
    _this.values = Array.prototype.slice.call(values);
    return _this;
  }

  _createClass(Enum, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      var length = this.values.length;
      if (length !== n.values.length) return false;

      for (var i = 0; i < length; ++i) {
        if (n.values[i] !== this.values[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "match",
    value: function match(n) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (i instanceof _type.default) {
            if (i.match(n)) return true;
          } else if (i === n) return true;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: "weight",
    value: function weight() {
      return _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1;
    }
  }]);

  return Enum;
}(_type.default);

exports.default = Enum;

},{"../weight":12,"./type":10}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Except =
/*#__PURE__*/
function (_Type) {
  _inherits(Except, _Type);

  function Except(types) {
    var _this;

    _classCallCheck(this, Except);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Except).call(this, "except"));
    _this.types = Array.prototype.slice.call(types);
    return _this;
  }

  _createClass(Except, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      var length = this.types.length;
      if (length !== n.types.length) return false;

      for (var i = 0; i < length; ++i) {
        if (n.types[i] !== this.types[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "match",
    value: function match(n) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (i instanceof _type.default) {
            if (i.match(n)) return false;
          } else if (n.__proto__.constructor === i) return false;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }
  }, {
    key: "weight",
    value: function weight() {
      return this.types.reduce(function (prev, next) {
        return prev + (next instanceof _type.default ? next.weight() : _weight.default.Normal);
      }, 0);
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1 + this.types.reduce(function (prev, next) {
        if (next instanceof _type.default) {
          if (prev >= next.depth()) return prev;else return next.depth();
        } else return 1;
      }, this.types[0].depth());
    }
  }]);

  return Except;
}(_type.default);

exports.default = Except;

},{"../weight":12,"./type":10}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Required =
/*#__PURE__*/
function (_Type) {
  _inherits(Required, _Type);

  function Required(type) {
    var _this;

    _classCallCheck(this, Required);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Required).call(this, "required"));
    _this.type = type;
    return _this;
  }

  _createClass(Required, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      if (this.type instanceof _type.default) return this.type.equals(n.type);else return this.type === n.type;
    }
  }, {
    key: "match",
    value: function match(n) {
      if (this.type instanceof _type.default) return this.type.match(n);else return n.__proto__.constructor === this.type;
    }
  }, {
    key: "weight",
    value: function weight() {
      return _weight.default.Normal;
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1 + (this.type instanceof _type.default) ? this.type.depth() : 0;
    }
  }]);

  return Required;
}(_type.default);

exports.default = Required;

},{"../weight":12,"./type":10}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Type = function Type(name) {
  _classCallCheck(this, Type);

  this.name = name;
};

exports.default = Type;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _weight = _interopRequireDefault(require("../weight"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Union =
/*#__PURE__*/
function (_Type) {
  _inherits(Union, _Type);

  function Union(types) {
    var _this;

    _classCallCheck(this, Union);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Union).call(this, "union"));
    _this.types = Array.prototype.slice.call(types);
    return _this;
  }

  _createClass(Union, [{
    key: "equals",
    value: function equals(n) {
      if (n.name !== this.name) return false;
      var length = this.types.length;
      if (length !== n.types.length) return false;

      for (var i = 0; i < length; ++i) {
        if (n.types[i] !== this.types[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "match",
    value: function match(n) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (i instanceof _type.default) {
            if (i.match(n)) return true;
          } else if (n.__proto__.constructor === i) return true;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: "weight",
    value: function weight() {
      return this.types.reduce(function (prev, next) {
        return prev + (next instanceof _type.default ? next.weight() : _weight.default.Normal);
      }, 0);
    }
  }, {
    key: "depth",
    value: function depth() {
      return 1 + this.types.reduce(function (prev, next) {
        if (next instanceof _type.default) {
          if (prev >= next.depth()) return prev;else return next.depth();
        } else return 1;
      }, this.types[0].depth());
    }
  }]);

  return Union;
}(_type.default);

exports.default = Union;

},{"../weight":12,"./type":10}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  Normal: 1
};
exports.default = _default;

},{}]},{},[1]);
