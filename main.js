import Any from "./types/any";
import Enum from "./types/enum";
import Union from "./types/union";
import Except from "./types/except";
import Array_ from "./types/array";
import Duck from "./types/duck";
import Required from "./types/required";
import Default from "./types/default";
import Endless from "./types/endless";

export const override = list => {
  // Check the arguments.
  if (!Array.isArray(list)) throw new Error("The argument is not an array!");
  let functions = list.map((func, index) => {
    if (!func instanceof Function) throw new Error("That's not a exact function at " + index);
    if (!func.typical_tag) {
      // Package it as a function, which the parameters are all typeness.
      let params = [];
      for (let i = 0; i < func.length; ++i) params.push(Types.Any);
      return typical(params, func);
    } else return func;
  }).reduce((list, func) => {
    // Compare func.parameters and each n.parameters in the list.
    let repeat = true;
    console.log("Now the func is", func.parameters);
    list.forEach(n => {
      console.log("Comparing", n.parameters);
      if (!repeat) return;
      let length = func.parameters.length;
      if (length !== n.parameters.length) {
        repeat = false;
        return;
      }
      for (let i = 0; i < length; ++i) {
        if (func.parameters[i] instanceof Type) {
          if (n.parameters[i] instanceof Type) repeat = func.parameters[i].equals(n.parameters[i]);
          else repeat = false;
        } else {
          if ((typeof func.parameters[i]) !== (typeof n.parameters[i])) repeat = false;
        }
      }
    });
    if (list.length > 0 && repeat) throw new Error("Repeatical parameters!");
    list.push(func);
    return list;
  }, []);

  // Create the middle-ware function.
  return function () {
    let args = Array.prototype.slice.call(arguments);
    // Pick candidate function.
    let candidated = functions.filter(f => {
      let pos = 0, flag = args.map(() => false);
      for (let param of f.parameters) {
        if ((!param instanceof Type) && (!args[pos] instanceof param)) return false;
        switch (param.name) {
          case "enum":
          case "union":
          case "except":
          case "array":
          case "duck":
          case "any":
            if (!param.match(args[pos])) return false;
            flag[pos++] = true;
            break;
          case "required":
            if (param.match(args[pos])) flag[pos++] = true;
            break;
          case "default":
            if (param.match(args[pos])) flag[pos++] = true;
            else {
              flag[pos++] = true;
              args = args.slice(0, pos).concat([param.value]).concat(args.slice(pos));
            }
            break;
          case "endless":
            while (param.match(args[pos])) flag[pos++] = true;
            break;
          default:
            throw new Error("Unknown type: " + param.name);
        }
      }
      flag = flag.reduce((prev, next) => prev && next);
      return flag;
    }).reduce((prev, next) => {
      let next_weight = next.map(param => param.weight()).reduce((prev, next) => prev + next);
      let next_depth = next.map(param => param.depth()).reduce((prev, next) => prev > next ? prev : next);
      let next_obj = {
        func: next,
        weight: next_weight,
        depth: next_depth
      }

      if (prev.func.level && next.leve) {
        if (prev.func.level > next.level) return prev;
        else if (prev.func.level < next.level) return next_obj;
        else throw new Error("Cannot have the same level override!");
      }
      else if (prev.func.level) return prev;
      else if (next.level) return next_obj;

      if (prev.weight > next.weight) return prev;
      else if (prev.depth > next_depth) return next_obj;
      else throw new Error(
        "Cannot parse these arguments to the exact function: ("
        + args.reduce((prev, next) => prev + ", " + next, "")
        + ")");
    }, { func: null, weight: 0, depth: Infinity }).func;

    return candidated.apply(this, args);
  };
}

export const typical = (params, func, level) => {
  func.typical_tag = true;

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
      } else if (typeof arr[0] !== 'object') {
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
      return new Array_(arr);
    }
  };

  var transform_object = obj => {
    for(let i of Object.keys(obj)) {
      if(Array.isArray(obj[i])) obj[i] = transform_array(obj[i]);
      else if(typeof obj[i] == 'object') obj[i] = transform_object(obj[i]);
    }
    return obj;
  };

  // Verify the parameter.
  if(Array.isArray(params)) params = transform_array(params);
  else if(typeof params === 'object') params = transform_object(params);

  // Write parameters and extra information to the functional object.
  func.parameters = params;

  if(level) if(typeof level !== 'number') throw new Error("Level must be a number!");
  func.level = level;

  return func;
};

export const Types = {
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