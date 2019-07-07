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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIiwidHlwZXMvYW55LmpzIiwidHlwZXMvYXJyYXkuanMiLCJ0eXBlcy9kZWZhdWx0LmpzIiwidHlwZXMvZHVjay5qcyIsInR5cGVzL2VuZGxlc3MuanMiLCJ0eXBlcy9lbnVtLmpzIiwidHlwZXMvZXhjZXB0LmpzIiwidHlwZXMvcmVxdWlyZWQuanMiLCJ0eXBlcy90eXBlLmpzIiwidHlwZXMvdW5pb24uanMiLCJ3ZWlnaHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7OztBQUVPLElBQU0sUUFBUSxHQUFHLFNBQVgsUUFBVyxDQUFBLElBQUksRUFBSTtBQUM5QjtBQUNBLE1BQUksQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsQ0FBTCxFQUEwQixNQUFNLElBQUksS0FBSixDQUFVLCtCQUFWLENBQU47QUFDMUIsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxVQUFDLElBQUQsRUFBTyxLQUFQLEVBQWlCO0FBQ3hDLFFBQUksRUFBRSxJQUFJLFlBQVksUUFBbEIsQ0FBSixFQUFpQyxNQUFNLElBQUksS0FBSixDQUFVLG9DQUFvQyxLQUE5QyxDQUFOOztBQUNqQyxRQUFJLENBQUMsSUFBSSxDQUFDLFdBQVYsRUFBdUI7QUFDckI7QUFDQSxVQUFJLE1BQU0sR0FBRyxFQUFiOztBQUNBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQXpCLEVBQWlDLEVBQUUsQ0FBbkM7QUFBc0MsUUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxHQUFsQjtBQUF0Qzs7QUFDQSxhQUFPLE9BQU8sQ0FBQyxNQUFELEVBQVMsSUFBVCxDQUFkO0FBQ0QsS0FMRCxNQUtPLE9B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SUFBRCxFQUFPLElBQVAsRUFBZ0I7QUFDM0MsWUFBSSxJQUFJLFlBQVksYUFBcEIsRUFBMEI7QUFDeEIsY0FBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUwsRUFBWixFQUEwQixPQUFPLElBQVAsQ0FBMUIsS0FDSyxPQUFPLElBQUksQ0FBQyxLQUFMLEVBQVA7QUFDTixTQUhELE1BSUssT0FBTyxDQUFQO0FBQ04sT0FOVSxFQU1SLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFkLEVBTlEsQ0FBWDtBQU9EOzs7O0VBMUNnQyxhOzs7Ozs7Ozs7OztlQ0hwQjtBQUNYLEVBQUEsTUFBTSxFQUFFO0FBREcsQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBBbnkgZnJvbSBcIi4vdHlwZXMvYW55XCI7XHJcbmltcG9ydCBFbnVtIGZyb20gXCIuL3R5cGVzL2VudW1cIjtcclxuaW1wb3J0IFVuaW9uIGZyb20gXCIuL3R5cGVzL3VuaW9uXCI7XHJcbmltcG9ydCBFeGNlcHQgZnJvbSBcIi4vdHlwZXMvZXhjZXB0XCI7XHJcbmltcG9ydCBBcnJheV8gZnJvbSBcIi4vdHlwZXMvYXJyYXlcIjtcclxuaW1wb3J0IER1Y2sgZnJvbSBcIi4vdHlwZXMvZHVja1wiO1xyXG5pbXBvcnQgUmVxdWlyZWQgZnJvbSBcIi4vdHlwZXMvcmVxdWlyZWRcIjtcclxuaW1wb3J0IERlZmF1bHQgZnJvbSBcIi4vdHlwZXMvZGVmYXVsdFwiO1xyXG5pbXBvcnQgRW5kbGVzcyBmcm9tIFwiLi90eXBlcy9lbmRsZXNzXCI7XHJcblxyXG5pbXBvcnQgVHlwZSBmcm9tIFwiLi90eXBlcy90eXBlXCI7XHJcblxyXG5leHBvcnQgY29uc3Qgb3ZlcnJpZGUgPSBsaXN0ID0+IHtcclxuICAvLyBDaGVjayB0aGUgYXJndW1lbnRzLlxyXG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGFyZ3VtZW50IGlzIG5vdCBhbiBhcnJheSFcIik7XHJcbiAgbGV0IGZ1bmN0aW9ucyA9IGxpc3QubWFwKChmdW5jLCBpbmRleCkgPT4ge1xyXG4gICAgaWYgKCEoZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkgdGhyb3cgbmV3IEVycm9yKFwiVGhhdCdzIG5vdCBhIGV4YWN0IGZ1bmN0aW9uIGF0IFwiICsgaW5kZXgpO1xyXG4gICAgaWYgKCFmdW5jLnR5cGljYWxfdGFnKSB7XHJcbiAgICAgIC8vIFBhY2thZ2UgaXQgYXMgYSBmdW5jdGlvbiwgd2hpY2ggdGhlIHBhcmFtZXRlcnMgYXJlIGFsbCB0eXBlbmVzcy5cclxuICAgICAgbGV0IHBhcmFtcyA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1bmMubGVuZ3RoOyArK2kpIHBhcmFtcy5wdXNoKFR5cGVzLkFueSk7XHJcbiAgICAgIHJldHVybiB0eXBpY2FsKHBhcmFtcywgZnVuYyk7XHJcbiAgICB9IGVsc2UgcmV0dXJuIGZ1bmM7XHJcbiAgfSlcclxuICAvLyAucmVkdWNlKChsaXN0LCBmdW5jKSA9PiB7XHJcbiAgLy8gICAvLyBDb21wYXJlIGZ1bmMucGFyYW1ldGVycyBhbmQgZWFjaCBuLnBhcmFtZXRlcnMgaW4gdGhlIGxpc3QuXHJcbiAgLy8gICBsZXQgcmVwZWF0ID0gdHJ1ZTtcclxuICAvLyAgIGNvbnNvbGUubG9nKFwiTm93IHRoZSBmdW5jIGlzXCIsIGZ1bmMucGFyYW1ldGVycyk7XHJcbiAgLy8gICBsaXN0LmZvckVhY2gobiA9PiB7XHJcbiAgLy8gICAgIGNvbnNvbGUubG9nKFwiQ29tcGFyaW5nXCIsIG4ucGFyYW1ldGVycyk7XHJcbiAgLy8gICAgIGlmICghcmVwZWF0KSByZXR1cm47XHJcbiAgLy8gICAgIGxldCBsZW5ndGggPSBmdW5jLnBhcmFtZXRlcnMubGVuZ3RoO1xyXG4gIC8vICAgICBpZiAobGVuZ3RoICE9PSBuLnBhcmFtZXRlcnMubGVuZ3RoKSB7XHJcbiAgLy8gICAgICAgcmVwZWF0ID0gZmFsc2U7XHJcbiAgLy8gICAgICAgcmV0dXJuO1xyXG4gIC8vICAgICB9XHJcbiAgLy8gICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAvLyAgICAgICBpZiAoZnVuYy5wYXJhbWV0ZXJzW2ldIGluc3RhbmNlb2YgVHlwZSkge1xyXG4gIC8vICAgICAgICAgaWYgKG4ucGFyYW1ldGVyc1tpXSBpbnN0YW5jZW9mIFR5cGUpIHJlcGVhdCA9IGZ1bmMucGFyYW1ldGVyc1tpXS5lcXVhbHMobi5wYXJhbWV0ZXJzW2ldKTtcclxuICAvLyAgICAgICAgIGVsc2UgcmVwZWF0ID0gZmFsc2U7XHJcbiAgLy8gICAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICAgIGlmICgodHlwZW9mIGZ1bmMucGFyYW1ldGVyc1tpXSkgIT09ICh0eXBlb2Ygbi5wYXJhbWV0ZXJzW2ldKSkgcmVwZWF0ID0gZmFsc2U7XHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9XHJcbiAgLy8gICB9KTtcclxuICAvLyAgIGNvbnNvbGUubG9nKFwiTGlzdDogXCIsIGxpc3QpO1xyXG4gIC8vICAgaWYgKGxpc3QubGVuZ3RoID4gMCAmJiByZXBlYXQpIHRocm93IG5ldyBFcnJvcihcIlJlcGVhdGljYWwgcGFyYW1ldGVycyFcIik7XHJcbiAgLy8gICBsaXN0LnB1c2goZnVuYyk7XHJcbiAgLy8gICByZXR1cm4gbGlzdDtcclxuICAvLyB9LCBbXSk7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgbWlkZGxlLXdhcmUgZnVuY3Rpb24uXHJcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICAgIC8vIFBpY2sgY2FuZGlkYXRlIGZ1bmN0aW9uLlxyXG4gICAgbGV0IGNhbmRpZGF0ZWQgPSBmdW5jdGlvbnMuZmlsdGVyKGYgPT4ge1xyXG4gICAgICBsZXQgcG9zID0gMCwgZmxhZyA9IGFyZ3MubWFwKCgpID0+IGZhbHNlKTtcclxuICAgICAgZm9yIChsZXQgcGFyYW0gb2YgZi5wYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgaWYgKCEocGFyYW0gaW5zdGFuY2VvZiBUeXBlKSkge1xyXG4gICAgICAgICAgaWYgKGFyZ3NbcG9zXSAmJiBhcmdzW3Bvc10uX19wcm90b19fLmNvbnN0cnVjdG9yID09PSBwYXJhbSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChwYXJhbS5uYW1lKSB7XHJcbiAgICAgICAgICBjYXNlIFwiZW51bVwiOlxyXG4gICAgICAgICAgY2FzZSBcInVuaW9uXCI6XHJcbiAgICAgICAgICBjYXNlIFwiZXhjZXB0XCI6XHJcbiAgICAgICAgICBjYXNlIFwiYXJyYXlcIjpcclxuICAgICAgICAgIGNhc2UgXCJkdWNrXCI6XHJcbiAgICAgICAgICBjYXNlIFwiYW55XCI6XHJcbiAgICAgICAgICAgIGlmICghYXJnc1twb3NdKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmICghcGFyYW0ubWF0Y2goYXJnc1twb3NdKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBmbGFnW3BvcysrXSA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcInJlcXVpcmVkXCI6XHJcbiAgICAgICAgICAgIGlmIChhcmdzW3Bvc10gJiYgcGFyYW0ubWF0Y2goYXJnc1twb3NdKSkgZmxhZ1twb3MrK10gPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJkZWZhdWx0XCI6XHJcbiAgICAgICAgICAgIGlmIChhcmdzW3Bvc10gJiYgcGFyYW0ubWF0Y2goYXJnc1twb3NdKSkgZmxhZ1twb3MrK10gPSB0cnVlO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBmbGFnW3BvcysrXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgYXJncyA9IGFyZ3Muc2xpY2UoMCwgcG9zKS5jb25jYXQoW3BhcmFtLnZhbHVlXSkuY29uY2F0KGFyZ3Muc2xpY2UocG9zKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwiZW5kbGVzc1wiOlxyXG4gICAgICAgICAgICB3aGlsZSAoYXJnc1twb3NdICYmIHBhcmFtLm1hdGNoKGFyZ3NbcG9zXSkpIGZsYWdbcG9zKytdID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHR5cGU6IFwiICsgcGFyYW0ubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGZsYWcgPSBmbGFnLmxlbmd0aCA+IDAgPyBmbGFnLnJlZHVjZSgocHJldiwgbmV4dCkgPT4gcHJldiAmJiBuZXh0KSA6IHRydWU7XHJcbiAgICAgIHJldHVybiBmbGFnO1xyXG4gICAgfSk7XHJcbiAgICAvLyAucmVkdWNlKChwcmV2LCBuZXh0KSA9PiB7XHJcbiAgICAvLyAgIGxldCBuZXh0X3dlaWdodCA9IG5leHQucGFyYW1ldGVycy5tYXAocGFyYW0gPT4gcGFyYW0ud2VpZ2h0KCkpO1xyXG4gICAgLy8gICBpZihuZXh0X3dlaWdodC5sZW5ndGggPiAwKSBuZXh0X3dlaWdodCA9IG5leHRfd2VpZ2h0LnJlZHVjZSgocHJldiwgbmV4dCkgPT4gcHJldiArIG5leHQpO1xyXG4gICAgLy8gICBlbHNlIG5leHRfd2VpZ2h0ID0gMDtcclxuXHJcbiAgICAvLyAgIGxldCBuZXh0X2RlcHRoID0gbmV4dC5wYXJhbWV0ZXJzLm1hcChwYXJhbSA9PiBwYXJhbS5kZXB0aCgpKTtcclxuICAgIC8vICAgaWYobmV4dF9kZXB0aC5sZW5ndGggPiAwKSBuZXh0X2RlcHRoID0gbmV4dF9kZXB0aC5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHByZXYgPiBuZXh0ID8gcHJldiA6IG5leHQpO1xyXG4gICAgLy8gICBlbHNlIG5leHRfZGVwdGggPSAwO1xyXG5cclxuICAgIC8vICAgbGV0IG5leHRfb2JqID0ge1xyXG4gICAgLy8gICAgIGZ1bmM6IG5leHQsXHJcbiAgICAvLyAgICAgd2VpZ2h0OiBuZXh0X3dlaWdodCxcclxuICAgIC8vICAgICBkZXB0aDogbmV4dF9kZXB0aFxyXG4gICAgLy8gICB9XHJcblxyXG4gICAgLy8gICBpZiAocHJldi5mdW5jLmxldmVsICYmIG5leHQubGV2ZWwpIHtcclxuICAgIC8vICAgICBpZiAocHJldi5mdW5jLmxldmVsID4gbmV4dC5sZXZlbCkgcmV0dXJuIHByZXY7XHJcbiAgICAvLyAgICAgZWxzZSBpZiAocHJldi5mdW5jLmxldmVsIDwgbmV4dC5sZXZlbCkgcmV0dXJuIG5leHRfb2JqO1xyXG4gICAgLy8gICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGhhdmUgdGhlIHNhbWUgbGV2ZWwgb3ZlcnJpZGUhXCIpO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyAgIGVsc2UgaWYgKHByZXYuZnVuYy5sZXZlbCkgcmV0dXJuIHByZXY7XHJcbiAgICAvLyAgIGVsc2UgaWYgKG5leHQubGV2ZWwpIHJldHVybiBuZXh0X29iajtcclxuXHJcbiAgICAvLyAgIGlmIChwcmV2LndlaWdodCA+IG5leHQud2VpZ2h0KSByZXR1cm4gcHJldjtcclxuICAgIC8vICAgZWxzZSBpZiAocHJldi5kZXB0aCA+IG5leHRfZGVwdGgpIHJldHVybiBuZXh0X29iajtcclxuICAgIC8vICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAvLyAgICAgXCJDYW5ub3QgcGFyc2UgdGhlc2UgYXJndW1lbnRzIHRvIHRoZSBleGFjdCBmdW5jdGlvbjogKFwiXHJcbiAgICAvLyAgICAgKyBhcmdzLnJlZHVjZSgocHJldiwgbmV4dCkgPT4gcHJldiArIFwiLCBcIiArIG5leHQsIFwiXCIpXHJcbiAgICAvLyAgICAgKyBcIilcIik7XHJcbiAgICAvLyB9LCB7IGZ1bmM6IG51bGwsIHdlaWdodDogMCwgZGVwdGg6IEluZmluaXR5IH0pLmZ1bmM7XHJcblxyXG4gICAgaWYoY2FuZGlkYXRlZC5sZW5ndGggPiAxKSB0aHJvdyBuZXcgRXJyb3IoXCJJdCBpcyBub3Qgc3VwcG9ydGVkIHRvIGZpbHRlciB0aGUgb3B0aW1hbCBmdW5jdGlvbiBmcm9tIG11bHRpcGxlIGNhbmRpZGF0ZSBmdW5jdGlvbnMuXCIpOyBcclxuICAgIGlmKGNhbmRpZGF0ZWQubGVuZ3RoIDwgMSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gbWF0Y2ghXCIpO1xyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZWRbMF0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgfTtcclxufVxyXG5cclxuLy8gVE9ETzogdHlwaWNhbCDmlLnmiJAgc3Ryb25nbHlcclxuZXhwb3J0IGNvbnN0IHR5cGljYWwgPSAocGFyYW1zLCBmdW5jLCBsZXZlbCkgPT4ge1xyXG4gIGZ1bmMudHlwaWNhbF90YWcgPSB0cnVlO1xyXG5cclxuICAvLyBDaGVjayB0aGUgcGFyYW1ldGVyLlxyXG4gIGlmKCFBcnJheS5pc0FycmF5KHBhcmFtcykpIHRocm93IG5ldyBFcnJvcihcIllvdSBzaG91bGQgcHJvdmlkZSBhbiBhcnJheSBhcyB0aGUgcGFyYW1ldGVyIGxpc3QhXCIpO1xyXG4gIGlmKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoXCJZb3Ugc2hvdWxkIHByb3ZpZGUgYW4gZXh0cmEgZnVuY3Rpb24hXCIpO1xyXG4gIGlmKGxldmVsICYmIHR5cGVvZiBsZXZlbCAhPT0gJ251bWJlcicpIHRocm93IG5ldyBFcnJvcihcIllvdSBzaG91bGQgcHJvdmlkZSBhIG51bWJlciBhcyB0aGUgbGV2ZWwhXCIpO1xyXG5cclxuICB2YXIgdHJhbnNmb3JtX2FycmF5ID0gYXJyID0+IHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSB0aHJvdyBuZXcgRXJyb3IoXCJJcyB0aGF0IGFuIGFycmF5PyFcIik7XHJcblxyXG4gICAgLy8gTGV0IGVhY2ggZWxlbWVudCBiZSBjb252ZXJ0ZWQuXHJcblxyXG4gICAgY29uc3QgbWFwX2FyciA9IG4gPT4ge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShuKSkgcmV0dXJuIHRyYW5zZm9ybV9hcnJheShuKTtcclxuICAgICAgZWxzZSBpZiAodHlwZW9mIG4gPT09ICdvYmplY3QnKSByZXR1cm4gdHJhbnNmb3JtX29iamVjdChuKTtcclxuICAgICAgZWxzZSByZXR1cm4gbjtcclxuICAgIH1cclxuXHJcbiAgICBhcnIgPSBhcnIubWFwKG1hcF9hcnIpO1xyXG5cclxuICAgIGlmIChhcnIubGVuZ3RoID4gMSkge1xyXG4gICAgICBpZiAoYXJyWzBdID09PSBcIiFcIikge1xyXG4gICAgICAgIC8vIEV4Y2VwdFxyXG4gICAgICAgIHJldHVybiBuZXcgRXhjZXB0KGFyci5zbGljZSgxKS5tYXAobWFwX2FycikpO1xyXG4gICAgICB9IGVsc2UgaWYgKGFyclswXSA9PT0gXCI/XCIpIHtcclxuICAgICAgICAvLyBSZXF1aXJlZFxyXG4gICAgICAgIGlmIChhcnIubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgLy8gUmVxdWlyZWQgKyA/XHJcbiAgICAgICAgICBpZiAoYXJyWzFdID09PSBcIiFcIikge1xyXG4gICAgICAgICAgICAvLyBSZXF1aXJlZCArIEV4Y2VwdFxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlcXVpcmVkKG5ldyBFeGNlcHQoYXJyLnNsaWNlKDIpKSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBSZXF1aXJlZCArIFVuaW9uXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVxdWlyZWQobmV3IFVuaW9uKGFyci5zbGljZSgxKSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSByZXR1cm4gbmV3IFJlcXVpcmVkKGFyclsxXSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoYXJyWzBdID09PSBcIj89XCIpIHtcclxuICAgICAgICAvLyBEZWZhdWx0XHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPiAzKSB7XHJcbiAgICAgICAgICBpZiAoYXJyWzJdID09PSBcIiFcIikge1xyXG4gICAgICAgICAgICAvLyBEZWZhdWx0ICsgRXhjZXB0XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGVmYXVsdChuZXcgRXhjZXB0KGFyci5zbGljZSgzKSksIGFyclsxXSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEZWZhdWx0ICsgVW5pb25cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0KG5ldyBVbmlvbihhcnIuc2xpY2UoMikpLCBhcnJbMV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSByZXR1cm4gbmV3IERlZmF1bHQoYXJyWzJdLCBhcnJbMV0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGFyclswXSA9PT0gXCIqXCIpIHtcclxuICAgICAgICAvLyBFbmRsZXNzXHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAvLyBFbmRsZXNzICsgP1xyXG4gICAgICAgICAgaWYgKGFyclsxXSA9PT0gXCIhXCIpIHtcclxuICAgICAgICAgICAgLy8gRW5kbGVzcyArIEV4Y2VwdFxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEVuZGxlc3MobmV3IEV4Y2VwdChhcnIuc2xpY2UoMikpKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEVuZGxlc3MgKyBVbmlvblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEVuZGxlc3MobmV3IFVuaW9uKGFyci5zbGljZSgxKSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSByZXR1cm4gbmV3IEVuZGxlc3MoYXJyWzFdKTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJyWzBdICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgYXJyWzBdICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gRW51bVxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICBOb3RpY2U6XHJcbiAgICAgICAgICBBcyB3ZWxsIGtub3duIHRvIGFsbCwgZXZlcnl0aGluZyBpbiBKYXZhU2NyaXB0IGlzIG9iamVjdCwgc28gd2UgZG9uJ3Qga25vdyB3aGF0IGV4YWN0IGNsYXNzIGFuIG9iamVjdCBpcy5cclxuICAgICAgICAgIFlvdSBjb3VsZCBvbmx5IHVzZSB0aGUgYnVpbGQtaW4gIHR5cGVzIHRvIGNyZWF0ZSB0aGUgZW51bSB0eXBlIGJ5IHVzaW5nIGFuIGFycmF5LFxyXG4gICAgICAgICAgb3RoZXJ3aXNlIHlvdSBzaG91bGQgdXNlIFwiVHlwZXMuRW51bSguLi4pXCIgdG8gY3JlYXRlIGl0LlxyXG4gICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIG5ldyBFbnVtKGFycik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gVW5pb25cclxuICAgICAgICByZXR1cm4gbmV3IFVuaW9uKGFyci5tYXAobWFwX2FycikpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBOb3JtYWwgYXJyYXkgcmVxdWlyZXMgYSBzaW5nbGUgdHlwZS5cclxuICAgICAgcmV0dXJuIG5ldyBBcnJheV8oYXJyWzBdKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgdHJhbnNmb3JtX29iamVjdCA9IG9iaiA9PiB7XHJcbiAgICBmb3IgKGxldCBpIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqW2ldKSkgb2JqW2ldID0gdHJhbnNmb3JtX2FycmF5KG9ialtpXSk7XHJcbiAgICAgIGVsc2UgaWYgKCghKG9ialtpXSBpbnN0YW5jZW9mIFR5cGUpKSAmJiB0eXBlb2Ygb2JqW2ldID09PSAnb2JqZWN0Jykgb2JqW2ldID0gdHJhbnNmb3JtX29iamVjdChvYmpbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEdWNrKG9iaik7XHJcbiAgfTtcclxuXHJcbiAgLy8gVmVyaWZ5IHRoZSBwYXJhbWV0ZXIuXHJcbiAgZnVuYy5wYXJhbWV0ZXJzID0gcGFyYW1zLm1hcChuID0+IHtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KG4pKSByZXR1cm4gdHJhbnNmb3JtX2FycmF5KG4pO1xyXG4gICAgZWxzZSBpZiAoKCEobiBpbnN0YW5jZW9mIFR5cGUpKSAmJiB0eXBlb2YgbiA9PT0gJ29iamVjdCcpIHJldHVybiB0cmFuc2Zvcm1fb2JqZWN0KG4pO1xyXG4gICAgZWxzZSByZXR1cm4gbjtcclxuICB9KTtcclxuXHJcbiAgZnVuYy5sZXZlbCA9IGxldmVsO1xyXG5cclxuICByZXR1cm4gZnVuYztcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBUeXBlcyA9IHtcclxuICBBbnk6IG5ldyBBbnkoKSxcclxuICBFbnVtOiB2YWx1ZXMgPT4gbmV3IEVudW0odmFsdWVzKSxcclxuICBVbmlvbjogdHlwZXMgPT4gbmV3IFVuaW9uKHR5cGVzKSxcclxuICBFeGNlcHQ6IHR5cGVzID0+IG5ldyBFeGNlcHQodHlwZXMpLFxyXG4gIEFycmF5OiB0eXBlID0+IG5ldyBBcnJheV8odHlwZSksXHJcbiAgRHVjazogb2JqID0+IG5ldyBEdWNrKG9iaiksXHJcbiAgUmVxdWlyZWQ6IHR5cGUgPT4gbmV3IFJlcXVpcmVkKHR5cGUpLFxyXG4gIERlZmF1bHQ6ICh0eXBlLCB2YWx1ZSkgPT4gbmV3IERlZmF1bHQodHlwZSwgdmFsdWUpLFxyXG4gIEVuZGxlc3M6IHR5cGUgPT4gbmV3IEVuZGxlc3ModHlwZSlcclxufTsiLCJpbXBvcnQgVHlwZSBmcm9tIFwiLi90eXBlXCI7XHJcbmltcG9ydCBXZWlnaHRzIGZyb20gXCIuLi93ZWlnaHRcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFueSBleHRlbmRzIFR5cGUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJhbnlcIik7XHJcbiAgfVxyXG5cclxuICBlcXVhbHMobikge1xyXG4gICAgcmV0dXJuIG4ubmFtZSA9PT0gdGhpcy5uYW1lO1xyXG4gIH1cclxuXHJcbiAgbWF0Y2gobikge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICB3ZWlnaHQoKSB7XHJcbiAgICByZXR1cm4gV2VpZ2h0cy5Ob3JtYWw7XHJcbiAgfVxyXG5cclxuICBkZXB0aCgpIHtcclxuICAgIHJldHVybiAxO1xyXG4gIH1cclxufSIsImltcG9ydCBUeXBlIGZyb20gXCIuL3R5cGVcIjtcclxuaW1wb3J0IFdlaWdodHMgZnJvbSBcIi4uL3dlaWdodFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJyYXlfIGV4dGVuZHMgVHlwZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlKSB7XHJcbiAgICAgIHN1cGVyKFwiYXJyYXlcIik7XHJcbiAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB9XHJcbiAgXHJcbiAgICBlcXVhbHMobikge1xyXG4gICAgICBpZiAobi5uYW1lICE9PSB0aGlzLm5hbWUpIHJldHVybiBmYWxzZTtcclxuICBcclxuICAgICAgaWYgKHRoaXMudHlwZSBpbnN0YW5jZW9mIFR5cGUpIHJldHVybiB0aGlzLnR5cGUuZXF1YWxzKG4udHlwZSk7XHJcbiAgXHJcbiAgICAgIGVsc2UgcmV0dXJuIHRoaXMudHlwZSA9PT0gbi50eXBlO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgbWF0Y2gobikge1xyXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobikpIHJldHVybiBmYWxzZTtcclxuICBcclxuICAgICAgaWYgKHRoaXMudHlwZSBpbnN0YW5jZW9mIFR5cGUpIHtcclxuICAgICAgICBmb3IgKGxldCBpIG9mIG4pIHtcclxuICAgICAgICAgIGlmICghdGhpcy50eXBlLm1hdGNoKGkpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAobGV0IGkgb2Ygbikge1xyXG4gICAgICAgICAgaWYgKGkuX19wcm90b19fLmNvbnN0cnVjdG9yICE9PSB0aGlzLnR5cGUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgXHJcbiAgICB3ZWlnaHQoKSB7XHJcbiAgICAgIHJldHVybiAodGhpcy50eXBlIGluc3RhbmNlb2YgVHlwZSkgPyB0aGlzLnR5cGUud2VpZ2h0KCkgOiBXZWlnaHRzLk5vcm1hbDtcclxuICAgIH1cclxuICBcclxuICAgIGRlcHRoKCkge1xyXG4gICAgICByZXR1cm4gMSArICh0aGlzLnR5cGUgaW5zdGFuY2VvZiBUeXBlKSA/IHRoaXMudHlwZS5kZXB0aCgpIDogMTtcclxuICAgIH1cclxuICB9IiwiaW1wb3J0IFR5cGUgZnJvbSBcIi4vdHlwZVwiO1xyXG5pbXBvcnQgV2VpZ2h0cyBmcm9tIFwiLi4vd2VpZ2h0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWZhdWx0IGV4dGVuZHMgVHlwZSB7XHJcbiAgY29uc3RydWN0b3IodHlwZSkge1xyXG4gICAgc3VwZXIoXCJkZWZhdWx0XCIpO1xyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICB9XHJcblxyXG4gIGVxdWFscyhuKSB7XHJcbiAgICBpZiAobi5uYW1lICE9PSB0aGlzLm5hbWUpIHJldHVybiBmYWxzZTtcclxuICAgIGlmICh0aGlzLnR5cGUgaW5zdGFuY2VvZiBUeXBlKSByZXR1cm4gdGhpcy50eXBlLmVxdWFscyhuLnR5cGUpO1xyXG4gICAgZWxzZSByZXR1cm4gdGhpcy50eXBlID09PSBuLnR5cGU7XHJcbiAgfVxyXG5cclxuICBtYXRjaChuKSB7XHJcbiAgICBpZiAodGhpcy50eXBlIGluc3RhbmNlb2YgVHlwZSkgcmV0dXJuIHRoaXMudHlwZS5tYXRjaChuKTtcclxuICAgIGVsc2UgcmV0dXJuIG4uX19wcm90b19fLmNvbnN0cnVjdG9yID09PSB0aGlzLnR5cGU7XHJcbiAgfVxyXG5cclxuICB3ZWlnaHQoKSB7XHJcbiAgICByZXR1cm4gV2VpZ2h0cy5Ob3JtYWw7XHJcbiAgfVxyXG5cclxuICBkZXB0aCgpIHtcclxuICAgIHJldHVybiAxICsgKHRoaXMudHlwZSBpbnN0YW5jZW9mIFR5cGUpID8gdGhpcy50eXBlLmRlcHRoKCkgOiAwO1xyXG4gIH1cclxufSIsImltcG9ydCBUeXBlIGZyb20gXCIuL3R5cGVcIjtcclxuaW1wb3J0IFdlaWdodHMgZnJvbSBcIi4uL3dlaWdodFwiO1xyXG5cclxuaW1wb3J0IFJlcXVpcmVkIGZyb20gXCIuL3JlcXVpcmVkXCI7XHJcbmltcG9ydCBEZWZhdWx0IGZyb20gXCIuL2RlZmF1bHRcIjtcclxuaW1wb3J0IEVuZGxlc3MgZnJvbSBcIi4vZW5kbGVzc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHVjayBleHRlbmRzIFR5cGUge1xyXG4gIGNvbnN0cnVjdG9yKG9iaikge1xyXG4gICAgc3VwZXIoXCJkdWNrXCIpO1xyXG5cclxuICAgIC8vIENoZWNrIHRoZSBvYmplY3QuXHJcbiAgICBjb25zdCBkZnMgPSBuID0+IHtcclxuICAgICAgZm9yIChsZXQgaSBvZiBPYmplY3Qua2V5cyhuKSkge1xyXG4gICAgICAgIGlmICghKG5baV0gaW5zdGFuY2VvZiBUeXBlIHx8IFsnZnVuY3Rpb24nLCAnb2JqZWN0J10uaW5kZXhPZih0eXBlb2YgbltpXSkgIT09IC0xKSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbm5vdCB1c2UgdGhlIGJ1aWxkLWluIHZhbHVlcyB0byBiZSB0aGUgY2xhc3MgdHlwZSFcIilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuW2ldID09PSAnb2JqZWN0JykgZGZzKGkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3QgdXNlIHRoZSBidWlsZC1pbiB2YWx1ZXMgdG8gYmUgdGhlIGNsYXNzIHR5cGUhXCIpO1xyXG4gICAgZGZzKG9iaik7XHJcblxyXG4gICAgdGhpcy50ZW1wbGF0ZSA9IG9iajtcclxuICB9XHJcblxyXG4gIGVxdWFscyhuKSB7XHJcbiAgICBpZiAobi5uYW1lICE9PSB0aGlzLm5hbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBkZnMgPSAobGVmdCwgcmlnaHQpID0+IHtcclxuICAgICAgbGV0IGxlZnRLZXlzID0gT2JqZWN0LmtleXMobGVmdCkuc29ydCgpLCByaWdodEtleXMgPSBPYmplY3Qua2V5cyhyaWdodCkuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGxlZnRLZXlzLmxlbmd0aCAhPT0gcmlnaHRLZXlzLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGxlZnRLZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgaWYgKGxlZnRLZXlzW2ldICE9PSByaWdodEtleXNbaV0pIHJldHVybiBmYWxzZTtcclxuICAgICAgICBpZiAodHlwZW9mIGxlZnRbbGVmdEtleXNbaV1dID09ICdvYmplY3QnICYmIHR5cGVvZiByaWdodFtyaWdodEtleXNbaV1dID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICBpZiAoIWRmcyhsZWZ0W2xlZnRLZXlzW2ldXSwgcmlnaHRbcmlnaHRLZXlzW2ldXSkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGxlZnRbbGVmdEtleXNbaV1dICE9PSByaWdodFtyaWdodEtleXNbaV1dKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGZzKHRoaXMudGVtcGxhdGUsIG4udGVtcGxhdGUpO1xyXG4gIH1cclxuXHJcbiAgbWF0Y2gobikge1xyXG4gICAgY29uc3QgZGZzID0gKHQsIG9iaikgPT4ge1xyXG4gICAgICBsZXQgb2JqS2V5cyA9IE9iamVjdC5rZXlzKG9iaikuc29ydCgpLCB0S2V5cyA9IE9iamVjdC5rZXlzKHQpLnNvcnQoKTtcclxuICAgICAgZm9yIChsZXQgaSBvZiB0S2V5cykge1xyXG4gICAgICAgIGlmIChvYmpLZXlzLmluZGV4T2YoaSkgPCAwKSB7XHJcbiAgICAgICAgICBsZXQgdHlwZSA9IHRbaV07XHJcbiAgICAgICAgICBpZiAodHlwZSBpbnN0YW5jZW9mIFJlcXVpcmVkKSBjb250aW51ZTtcclxuICAgICAgICAgIGlmICh0eXBlIGluc3RhbmNlb2YgRGVmYXVsdCkgY29udGludWU7XHJcbiAgICAgICAgICBpZiAodHlwZSBpbnN0YW5jZW9mIEVuZGxlc3MpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgLy8gVGhpcyBkdWNrIG9iamVjdCBtdXN0IGhhcyB0aGlzIGtleSwgc28gaXQgdmVyZmllcyBmYWlsdXJlLlxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRbaV0gaW5zdGFuY2VvZiBUeXBlKSAmJiAoIXRbaV0ubWF0Y2gob2JqW2ldKSkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBlbHNlIGlmICgodHlwZW9mIHRbaV0gPT09ICdvYmplY3QnICYmICghZGZzKHRbaV0sIG9ialtpXSkpKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGVsc2UgaWYgKG9ialtpXS5fX3Byb3RvX18uY29uc3RydWN0b3IgIT09IHRbaV0pIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGZzKHRoaXMudGVtcGxhdGUsIG4pO1xyXG4gIH1cclxuXHJcbiAgd2VpZ2h0KCkge1xyXG4gICAgcmV0dXJuIFdlaWdodHMuTm9ybWFsO1xyXG4gIH1cclxuXHJcbiAgZGVwdGgoKSB7XHJcbiAgICByZXR1cm4gMTtcclxuICB9XHJcbn0iLCJpbXBvcnQgVHlwZSBmcm9tIFwiLi90eXBlXCI7XHJcbmltcG9ydCBXZWlnaHRzIGZyb20gXCIuLi93ZWlnaHRcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZGxlc3MgZXh0ZW5kcyBUeXBlIHtcclxuICBjb25zdHJ1Y3Rvcih0eXBlKSB7XHJcbiAgICBzdXBlcihcImVuZGxlc3NcIik7XHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gIH1cclxuXHJcbiAgZXF1YWxzKG4pIHtcclxuICAgIGlmIChuLm5hbWUgIT09IHRoaXMubmFtZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgaWYgKHRoaXMudHlwZSBpbnN0YW5jZW9mIFR5cGUpIHJldHVybiB0aGlzLnR5cGUuZXF1YWxzKG4udHlwZSk7XHJcbiAgICBlbHNlIHJldHVybiB0aGlzLnR5cGUgPT09IG4udHlwZTtcclxuICB9XHJcblxyXG4gIG1hdGNoKG4pIHtcclxuICAgIGlmICh0aGlzLnR5cGUgaW5zdGFuY2VvZiBUeXBlKSByZXR1cm4gdGhpcy50eXBlLm1hdGNoKG4pO1xyXG4gICAgZWxzZSByZXR1cm4gbi5fX3Byb3RvX18uY29uc3RydWN0b3IgPT09IHRoaXMudHlwZTtcclxuICB9XHJcblxyXG4gIHdlaWdodCgpIHtcclxuICAgIHJldHVybiBXZWlnaHRzLk5vcm1hbDtcclxuICB9XHJcblxyXG4gIGRlcHRoKCkge1xyXG4gICAgcmV0dXJuIDEgKyAodGhpcy50eXBlIGluc3RhbmNlb2YgVHlwZSkgPyB0aGlzLnR5cGUuZGVwdGgoKSA6IDA7XHJcbiAgfVxyXG59IiwiaW1wb3J0IFR5cGUgZnJvbSBcIi4vdHlwZVwiO1xyXG5pbXBvcnQgV2VpZ2h0cyBmcm9tIFwiLi4vd2VpZ2h0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnVtIGV4dGVuZHMgVHlwZSB7XHJcbiAgY29uc3RydWN0b3IodmFsdWVzKSB7XHJcbiAgICBzdXBlcihcImVudW1cIik7XHJcbiAgICB0aGlzLnZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHZhbHVlcyk7XHJcbiAgfVxyXG5cclxuICBlcXVhbHMobikge1xyXG4gICAgaWYgKG4ubmFtZSAhPT0gdGhpcy5uYW1lKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IHRoaXMudmFsdWVzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobGVuZ3RoICE9PSBuLnZhbHVlcy5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgaWYgKG4udmFsdWVzW2ldICE9PSB0aGlzLnZhbHVlc1tpXSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBtYXRjaChuKSB7XHJcbiAgICBmb3IgKGxldCBpIG9mIHRoaXMudmFsdWVzKSB7XHJcbiAgICAgIGlmIChpIGluc3RhbmNlb2YgVHlwZSkge1xyXG4gICAgICAgIGlmIChpLm1hdGNoKG4pKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChpID09PSBuKSByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHdlaWdodCgpIHtcclxuICAgIHJldHVybiBXZWlnaHRzLk5vcm1hbDtcclxuICB9XHJcblxyXG4gIGRlcHRoKCkge1xyXG4gICAgcmV0dXJuIDE7XHJcbiAgfVxyXG59IiwiaW1wb3J0IFR5cGUgZnJvbSBcIi4vdHlwZVwiO1xyXG5pbXBvcnQgV2VpZ2h0cyBmcm9tIFwiLi4vd2VpZ2h0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGNlcHQgZXh0ZW5kcyBUeXBlIHtcclxuICBjb25zdHJ1Y3Rvcih0eXBlcykge1xyXG4gICAgc3VwZXIoXCJleGNlcHRcIik7XHJcbiAgICB0aGlzLnR5cGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodHlwZXMpO1xyXG4gIH1cclxuXHJcbiAgZXF1YWxzKG4pIHtcclxuICAgIGlmIChuLm5hbWUgIT09IHRoaXMubmFtZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGxldCBsZW5ndGggPSB0aGlzLnR5cGVzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobGVuZ3RoICE9PSBuLnR5cGVzLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAobi50eXBlc1tpXSAhPT0gdGhpcy50eXBlc1tpXSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBtYXRjaChuKSB7XHJcbiAgICBmb3IgKGxldCBpIG9mIHRoaXMudHlwZXMpIHtcclxuICAgICAgaWYgKGkgaW5zdGFuY2VvZiBUeXBlKSB7XHJcbiAgICAgICAgaWYgKGkubWF0Y2gobikpIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChuLl9fcHJvdG9fXy5jb25zdHJ1Y3RvciA9PT0gaSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICB3ZWlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlcy5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHByZXYgKyAobmV4dCBpbnN0YW5jZW9mIFR5cGUgPyBuZXh0LndlaWdodCgpIDogV2VpZ2h0cy5Ob3JtYWwpLCAwKTtcclxuICB9XHJcblxyXG4gIGRlcHRoKCkge1xyXG4gICAgcmV0dXJuIDEgKyB0aGlzLnR5cGVzLnJlZHVjZSgocHJldiwgbmV4dCkgPT4ge1xyXG4gICAgICBpZiAobmV4dCBpbnN0YW5jZW9mIFR5cGUpIHtcclxuICAgICAgICBpZiAocHJldiA+PSBuZXh0LmRlcHRoKCkpIHJldHVybiBwcmV2O1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIG5leHQuZGVwdGgoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHJldHVybiAxO1xyXG4gICAgfSwgdGhpcy50eXBlc1swXS5kZXB0aCgpKTtcclxuICB9XHJcbn0iLCJpbXBvcnQgVHlwZSBmcm9tIFwiLi90eXBlXCI7XHJcbmltcG9ydCBXZWlnaHRzIGZyb20gXCIuLi93ZWlnaHRcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcXVpcmVkIGV4dGVuZHMgVHlwZSB7XHJcbiAgY29uc3RydWN0b3IodHlwZSkge1xyXG4gICAgc3VwZXIoXCJyZXF1aXJlZFwiKTtcclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgfVxyXG5cclxuICBlcXVhbHMobikge1xyXG4gICAgaWYgKG4ubmFtZSAhPT0gdGhpcy5uYW1lKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAodGhpcy50eXBlIGluc3RhbmNlb2YgVHlwZSkgcmV0dXJuIHRoaXMudHlwZS5lcXVhbHMobi50eXBlKTtcclxuICAgIGVsc2UgcmV0dXJuIHRoaXMudHlwZSA9PT0gbi50eXBlO1xyXG4gIH1cclxuXHJcbiAgbWF0Y2gobikge1xyXG4gICAgaWYgKHRoaXMudHlwZSBpbnN0YW5jZW9mIFR5cGUpIHJldHVybiB0aGlzLnR5cGUubWF0Y2gobik7XHJcbiAgICBlbHNlIHJldHVybiBuLl9fcHJvdG9fXy5jb25zdHJ1Y3RvciA9PT0gdGhpcy50eXBlO1xyXG4gIH1cclxuXHJcbiAgd2VpZ2h0KCkge1xyXG4gICAgcmV0dXJuIFdlaWdodHMuTm9ybWFsO1xyXG4gIH1cclxuXHJcbiAgZGVwdGgoKSB7XHJcbiAgICByZXR1cm4gMSArICh0aGlzLnR5cGUgaW5zdGFuY2VvZiBUeXBlKSA/IHRoaXMudHlwZS5kZXB0aCgpIDogMDtcclxuICB9XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlIHtcclxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gIH1cclxufSIsImltcG9ydCBUeXBlIGZyb20gXCIuL3R5cGVcIjtcclxuaW1wb3J0IFdlaWdodHMgZnJvbSBcIi4uL3dlaWdodFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVW5pb24gZXh0ZW5kcyBUeXBlIHtcclxuICBjb25zdHJ1Y3Rvcih0eXBlcykge1xyXG4gICAgc3VwZXIoXCJ1bmlvblwiKTtcclxuICAgIHRoaXMudHlwZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0eXBlcyk7XHJcbiAgfVxyXG5cclxuICBlcXVhbHMobikge1xyXG4gICAgaWYgKG4ubmFtZSAhPT0gdGhpcy5uYW1lKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IHRoaXMudHlwZXMubGVuZ3RoO1xyXG5cclxuICAgIGlmIChsZW5ndGggIT09IG4udHlwZXMubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmIChuLnR5cGVzW2ldICE9PSB0aGlzLnR5cGVzW2ldKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIG1hdGNoKG4pIHtcclxuICAgIGZvciAobGV0IGkgb2YgdGhpcy50eXBlcykge1xyXG4gICAgICBpZiAoaSBpbnN0YW5jZW9mIFR5cGUpIHtcclxuICAgICAgICBpZiAoaS5tYXRjaChuKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobi5fX3Byb3RvX18uY29uc3RydWN0b3IgPT09IGkpIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgd2VpZ2h0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHlwZXMucmVkdWNlKChwcmV2LCBuZXh0KSA9PiBwcmV2ICsgKG5leHQgaW5zdGFuY2VvZiBUeXBlID8gbmV4dC53ZWlnaHQoKSA6IFdlaWdodHMuTm9ybWFsKSwgMCk7XHJcbiAgfVxyXG5cclxuICBkZXB0aCgpIHtcclxuICAgIHJldHVybiAxICsgdGhpcy50eXBlcy5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHtcclxuICAgICAgaWYgKG5leHQgaW5zdGFuY2VvZiBUeXBlKSB7XHJcbiAgICAgICAgaWYgKHByZXYgPj0gbmV4dC5kZXB0aCgpKSByZXR1cm4gcHJldjtcclxuICAgICAgICBlbHNlIHJldHVybiBuZXh0LmRlcHRoKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSByZXR1cm4gMTtcclxuICAgIH0sIHRoaXMudHlwZXNbMF0uZGVwdGgoKSk7XHJcbiAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgTm9ybWFsOiAxXHJcbn0iXX0=
