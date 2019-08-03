const Type = require("./type");
const Weights = require("../weight");

module.exports = class Except extends Type {
  constructor(types) {
    super("except");
    this.types = Array.prototype.slice.call(types);

    this.equals.bind(this);
    this.match.bind(this);
    this.weight.bind(this);
    this.depth.bind(this);
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
      else if (n.__proto__.constructor === i) return false;
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