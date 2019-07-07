const Weights = {
  Normal: 1
};

class Type {
  constructor(name) {
    this.name = name;
  }
}

class Any extends Type {
  constructor() {
    super("any");
  }

  equals(n) {
    return n.name === this.name;
  }

  match(n) {
    return true;
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1;
  }
}

class Array_ extends Type {
  constructor(type) {
    super("array");
    this.type = type;
  }

  equals(n) {
    if (n.name !== this.name) return false;

    if (this.type instanceof Type) return this.type.equals(n.type);

    else return this.type === n.type;
  }

  match(n) {
    if (!Array.isArray(n)) return false;

    if (this.type instanceof Type) {
      for (let i of n) {
        if (!this.type.match(i)) return false;
      }
    } else {
      for (let i of n) {
        if (!i instanceof this.type) return false;
      }
    }
    return true;
  }

  weight() {
    return (this.type instanceof Type) ? this.type.weight() : Weights.Normal;
  }

  depth() {
    return 1 + (this.type instanceof Type) ? this.type.depth() : 1;
  }
}

class Default extends Type {
  constructor(type) {
    super("default");
    this.type = type;
  }

  equals(n) {
    if (n.name !== this.name) return false;
    if (this.type instanceof Type) return this.type.equals(n.type);
    else return this.type === n.type;
  }

  match(n) {
    if (this.type instanceof Type) return this.type.match(n);
    else return n instanceof this.type;
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1 + (this.type instanceof Type) ? this.type.depth() : 0;
  }
}

class Duck extends Type {
  constructor(obj) {
    super("duck");

    // Check the object.
    const dfs = n => {
      for (let i of Object.keys(n)) {
        if (!(i instanceof Type || ['function', 'object'].indexOf(i) !== -1)) {
          throw new Error("You cannot use the build-in values to be the class type!")
        }
        if (typeof i === 'object') dfs(i);
      }
    }
    if (typeof obj !== 'object') throw new Error("You cannot use the build-in values to be the class type!");
    dfs(obj);

    this.template = obj;
  }

  equals(n) {
    if (n.name !== this.name) return false;

    const dfs = (left, right) => {
      let leftKeys = Object.keys(left).sort(), rightKeys = Object.keys(right).sort();

      if (leftKeys.length !== rightKeys.length) return false;

      for (let i = 0, length = leftKeys.length; i < length; ++i) {
        if (leftKeys[i] !== rightKeys[i]) return false;
        if (typeof left[leftKeys[i]] == 'object' && typeof right[rightKeys[i]] == 'object') {
          if (!dfs(left[leftKeys[i]], right[rightKeys[i]])) return false;
        } else {
          if (left[leftKeys[i]] !== right[rightKeys[i]]) return false;
        }
      }

      return true;
    }

    return dfs(this.template, n.template);
  }

  match(n) {
    const dfs = (t, obj) => {
      let objKeys = Object.keys(obj).sort(), tKeys = Object.keys(t).sort();
      for (let i of tKeys) {
        if (objKeys.indexOf(i) < 0) {
          let type = t[i];
          if (type instanceof Required) continue;
          if (type instanceof Default) continue;
          if (type instanceof Endless) continue;
          // This duck object must has this key, so it verfies failure.
          return false;
        }
        if ((t[i] instanceof Type) && (!t[i].match(obj[i]))) return false;
        else if ((typeof t[i] === 'object' && (!dfs(t[i], obj[i])))) return false;
        else if (!(obj[i] instanceof t[i])) return false;
      }
      return true;
    }

    return dfs(this.template, n);
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1;
  }
}

class Endless extends Type {
  constructor(type) {
    super("endless");
    this.type = type;
  }

  equals(n) {
    if (n.name !== this.name) return false;
    if (this.type instanceof Type) return this.type.equals(n.type);
    else return this.type === n.type;
  }

  match(n) {
    if (this.type instanceof Type) return this.type.match(n);
    else return n instanceof this.type;
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1 + (this.type instanceof Type) ? this.type.depth() : 0;
  }
}

class Enum extends Type {
  constructor(...values) {
    super("enum");
    this.values = Array.prototype.slice.call(values);
  }

  equals(n) {
    if (n.name !== this.name) return false;

    let length = this.values.length;

    if (length !== n.values.length) return false;
    for (let i = 0; i < length; ++i) {
      if (n.values[i] !== this.values[i]) {
        return false;
      }
    }
    return true;
  }

  match(n) {
    for (let i of this.value) {
      if (i instanceof Type) {
        if (i.match(n)) return true;
      }
      else if (i === n) return true;
    }
    return false;
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1;
  }
}

class Except extends Type {
  constructor(...types) {
    super("except");
    this.types = Array.prototype.slice.call(types);
  }

  equals(n) {
    if (n.name !== this.name) return false;

    let length = this.types.length;

    if (length !== n.types.length) return false;
    for (let i = 0; i < length; ++i) {
      if (n.types[i] !== this.types[i]) {
        return false;
      }
    }
    return true;
  }

  match(n) {
    for (let i of this.types) {
      if (i instanceof Type) {
        if (i.match(n)) return false;
      }
      else if (n instanceof i) return false;
    }
    return true;
  }

  weight() {
    return this.types.reduce((prev, next) => prev + (next instanceof Type ? next.weight() : Weights.Normal), 0);
  }

  depth() {
    return 1 + this.types.reduce((prev, next) => {
      if (next instanceof Type) {
        if (prev >= next.depth()) return prev;
        else return next.depth();
      }
      else return 1;
    }, this.types[0].depth());
  }
}

class Required extends Type {
  constructor(type) {
    super("required");
    this.type = type;
  }

  equals(n) {
    if (n.name !== this.name) return false;
    if (this.type instanceof Type) return this.type.equals(n.type);
    else return this.type === n.type;
  }

  match(n) {
    if (this.type instanceof Type) return this.type.match(n);
    else return n instanceof this.type;
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1 + (this.type instanceof Type) ? this.type.depth() : 0;
  }
}

class Union extends Type {
  constructor(...types) {
    super("union");
    this.types = Array.prototype.slice.call(types);
  }

  equals(n) {
    if (n.name !== this.name) return false;

    let length = this.types.length;

    if (length !== n.types.length) return false;
    for (let i = 0; i < length; ++i) {
      if (n.types[i] !== this.types[i]) {
        return false;
      }
    }
    return true;
  }

  match(n) {
    for (let i of this.types) {
      if (i instanceof Type) {
        if (i.match(n)) return true;
      }
      else if (n instanceof i) return true;
    }
    return false;
  }

  weight() {
    return this.types.reduce((prev, next) => prev + (next instanceof Type ? next.weight() : Weights.Normal), 0);
  }

  depth() {
    return 1 + this.types.reduce((prev, next) => {
      if (next instanceof Type) {
        if (prev >= next.depth()) return prev;
        else return next.depth();
      }
      else return 1;
    }, this.types[0].depth());
  }
}

const override = list => {
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
  })
  // .reduce((list, func) => {
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
      flag = flag.length > 0 ? flag.reduce((prev, next) => prev && next) : true;
      return flag;
    });
    // .reduce((prev, next) => {
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

    if(candidated.length > 1) throw new Error("It is not supported to filter the optimal function from multiple candidate functions."); 
    if(candidated.length < 1) throw new Error("No match!");
    return candidated[0].apply(this, args);
  };
}

// TODO: typical 改成 strongly
const typical = (params, func, level) => {
  func.typical_tag = true;

  // Check the parameter.
  if(!Array.isArray(params)) throw new Error("You should provide an array as the parameter list!");
  if(typeof func !== 'function') throw new Error("You should provide an extra function!");
  if(level && typeof level !== 'number') throw new Error("You should provide a number as the level!");

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
    for (let i of Object.keys(obj)) {
      if (Array.isArray(obj[i])) obj[i] = transform_array(obj[i]);
      else if (typeof obj[i] == 'object') obj[i] = transform_object(obj[i]);
    }
    return obj;
  };

  // Verify the parameter.
  params.map(n => {
    if (Array.isArray(n)) return transform_array(n);
    else if (typeof n === 'object') return transform_object(n);
    else return n;
  })
  
  // Write parameters and extra information to the functional object.
  func.parameters = params;

  func.level = level;

  return func;
};

const Types = {
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