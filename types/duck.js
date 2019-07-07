import Type from "./type";
import Weights from "../weight";

import Required from "./required";
import Default from "./default";
import Endless from "./endless";

export default class Duck extends Type {
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
        else if (obj[i].__proto__.constructor !== t[i]) return false;
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