import Type from "./type";
import Weights from "../weight";

export default class Any extends Type {
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