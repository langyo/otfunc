const Type = require("./type");
const Weights = require("../weight");

module.exports = class Any extends Type {
  constructor() {
    super("any");

    this.equals.bind(this);
    this.match.bind(this);
    this.weight.bind(this);
    this.depth.bind(this);
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