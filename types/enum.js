const Type = require("./type");
const Weights = require("../weight");

module.exports = class Enum extends Type {
  constructor(values) {
    super("enum");
    this.values = Array.prototype.slice.call(values);

    this.equals.bind(this);
    this.match.bind(this);
    this.weight.bind(this);
    this.depth.bind(this);
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
    for (let i of this.values) {
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