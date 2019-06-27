const override = list => {
  // Check the arguments.
  if(!Array.isArray(list)) throw new Error("The argument is not an array!");
  let functions = list.map((func, index) => {
    if(!func instanceof Function) throw new Error("That's not a current function at " + index);
    if(!func.typical_tag) {
      // Package it as a function, which the parameters are all typeness.
      let params = [];
      for(let i = 0; i < func.length; ++i) params.push(Types.Any);
      return typical(params, func);
    } else return func;
  }).reduce((list, func) => {
    let repeat = true;
    list.forEach(n => {
      if(!repeat) return;
      let length = func.parameters.length;
      if(length !== n.parameters.length) return;
      for(let i = 0; i < length; ++i) {
        if(func.parameters[i] instanceof Type){
          if(n.parameters[i] instanceof Type) repeat = func.parameters[i].equals(n.parameters[i]);
          else repeat = false;
	} else {
          if((typeof func.parameters[i]) !== (typeof n.parameters[i])) repeat = false;
	}
      }
    });
    if(list.length > 0 && repeat) throw new Error("Repeatical parameters!");
    list.push(func);
    return list;
  }, []);

  // Create the middle-ware function.
  return function() {
    let args = Array.prototype.slice.call(arguments);
    // Pick candidate function.
    let candidated = functions.filter(f => {
      let pos = 0, flag = args.map(() => false);
      for(let param of f.parameters) {
        if((!param instanceof Type) && (!args[pos] instanceof param)) return false;
        switch(param.name) {
	  case "enum":
          case "union":
	  case "except":
          case "array":
          case "duck":
          case "any":
            if(!param.match(args[pos])) return false;
            flag[pos++] = true;
            break;
	case "required":
            if(param.match(args[pos])) flag[pos++] = true;
            break;
        case "default":
            if(param.match(args[pos])) flag[pos++] = true;
            else {
              flag[pos++] = true;
              args = 
	    }
            break;
	}
      }
    });
  };
}
