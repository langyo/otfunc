import Type from "./type";
import Weights from "../weight";

export default class Default extends Type {
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
    else return n.__proto__.constructor === this.type;
  }

  weight() {
    return Weights.Normal;
  }

  depth() {
    return 1 + (this.type instanceof Type) ? this.type.depth() : 0;
  }
}