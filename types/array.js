import Type from "./type";
import Weights from "../weight";

export default class Array_ extends Type {
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