const Any = require("./types/any");
const Enum = require("./types/enum");
const Union = require("./types/union");
const Except = require("./types/except");
const Array_ = require("./types/array");
const Duck = require("./types/duck");
const Required = require("./types/required");
const Default = require("./types/default");
const Endless = require("./types/endless");

const Type = require("./types/type");

var override = list => {
  // Check the arguments.
  if (!Array.isArray(list)) throw new Error("The argument is not an array!");
  let functions = list.map((func, index) => {
    if (!(func instanceof Function)) throw new Error("That's not a exact function at " + index);
    if (!func.strongly_tag) {
      // Package it as a function, which the parameters are all typeness.
      let params = [];
      for (let i = 0; i < func.length; ++i) params.push(Types.Any);
      return strongly(params, func);
    } else return func;
  });

  // Create the middle-ware function.
  return function () {
    let args = Array.prototype.slice.call(arguments);
    // Pick candidate function.
    let candidated = functions.filter(f => {
      let pos = 0, flag = args.map(() => false);
      for (let param of f.parameters) {
        if (!(param instanceof Type)) {
          if (args[pos] && args[pos].__proto__.constructor === param) return true;
          else return false;
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
            if (args[pos] && param.match(args[pos])) flag[pos++] = true;
            else {
              flag[pos++] = true;
              args = args.slice(0, pos).concat([param.value]).concat(args.slice(pos));
            }
            break;
          case "endless":
            while (args[pos] && param.match(args[pos])) flag[pos++] = true;
            break;
          default:
            throw new Error("Unknown type: " + param.name);
        }
      }
      flag = flag.length > 0 ? flag.reduce((prev, next) => prev && next) : true;
      return flag;
    });

    if (candidated.length > 1) throw new Error("It is not supported to filter the optimal function = require(multiple candidate functions.");
    if (candidated.length < 1) throw new Error("No match!");
    return candidated[0].apply(this, args);
  };
};

var strongly = (params, func, level) => {
  func.strongly_tag = true;

  // Check the parameter.
  if (!Array.isArray(params)) throw new Error("You should provide an array as the parameter list!");
  if (typeof func !== 'function') throw new Error("You should provide an extra function!");
  if (level && typeof level !== 'number') throw new Error("You should provide a number as the level!");

  var transform_array = arr => {
    if (!Array.isArray(arr)) throw new Error("Is that an array?!");

    // Let each element be converted.

    const map_arr = n => {
      if (Array.isArray(n)) return transform_array(n);
      else if (typeof n === 'object') return transform_object(n);
      else return n;
    }

    arr = arr.map(map_arr);

    if (arr.length > 1) {
      if (arr[0] === "!") {
        // Except
        return new Except(arr.slice(1).map(map_arr));
      } else if (arr[0] === "?") {
        // Required
        if (arr.length > 2) {
          // Required + ?
          if (arr[1] === "!") {
            // Required + Except
            return new Required(new Except(arr.slice(2)));
          } else {
            // Required + Union
            return new Required(new Union(arr.slice(1)));
          }
        } else return new Required(arr[1]);
      } else if (arr[0] === "?=") {
        // Default
        if (arr.length > 3) {
          if (arr[2] === "!") {
            // Default + Except
            return new Default(new Except(arr.slice(3)), arr[1]);
          } else {
            // Default + Union
            return new Default(new Union(arr.slice(2)), arr[1]);
          }
        } else return new Default(arr[2], arr[1]);
      } else if (arr[0] === "*") {
        // Endless
        if (arr.length > 2) {
          // Endless + ?
          if (arr[1] === "!") {
            // Endless + Except
            return new Endless(new Except(arr.slice(2)));
          } else {
            // Endless + Union
            return new Endless(new Union(arr.slice(1)));
          }
        } else return new Endless(arr[1]);
      } else if (typeof arr[0] !== 'object' && typeof arr[0] !== 'function') {
        // Enum
        /*
          Notice:
          As well known to all, everything in JavaScript is object, so we don't know what exact class an object is.
          You could only use the build-in  types to create the enum type by using an array,
          otherwise you should use "Types.Enum(...)" to create it.
        */
        return new Enum(arr);
      } else {
        // Union
        return new Union(arr.map(map_arr));
      }
    } else {
      // Normal array requires a single type.
      return new Array_(arr[0]);
    }
  };

  var transform_object = obj => {
    for (let i of Object.keys(obj)) {
      if (Array.isArray(obj[i])) obj[i] = transform_array(obj[i]);
      else if ((!(obj[i] instanceof Type)) && typeof obj[i] === 'object') obj[i] = transform_object(obj[i]);
    }
    return new Duck(obj);
  };

  // Verify the parameter.
  func.parameters = params.map(n => {
    if (Array.isArray(n)) return transform_array(n);
    else if ((!(n instanceof Type)) && typeof n === 'object') return transform_object(n);
    else return n;
  });

  func.level = level;

  return func;
};

var Types = {
  Any: new Any(),
  Enum: values => new Enum(values),
  Union: types => new Union(types),
  Except: types => new Except(types),
  Array: type => new Array_(type),
  Duck: obj => new Duck(obj),
  Required: type => new Required(type),
  Default: (type, value) => new Default(type, value),
  Endless: type => new Endless(type)
};

module.exports = {
  override: override,

  strongly: strongly,

  Types: Types
}