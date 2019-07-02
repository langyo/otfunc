import { override, typical, Types } from "./main";

describe("无类型限定的函数重载", () => {
    const funcBasic = override([
        // 演示最基本的函数重载。
        () => true,

        (a, b) => [a, b]
    ]);

    test("无参数", () => {
        expect(funcBasic()).toBe(true);
    });

    test("带两个参数", () => {
        expect(funcBasic(1, 2).toBe([1, 2]));
        expect(funcBasic("a", "b").toBe(["a", "b"]));
    });
});


describe("带类型限定的函数重载", () => {
    const func = override([
        // 演示带有类型限定的一部分函数重载。
        typical([], () => true),

        typical(
            [Number, String],
            (n, s) => [n, s]
        ),

        typical(
            [[Number]],
            arr => arr
        ),

        typical(
            [{
                name: String,
                score: Number
            }],
            obj => obj
        ),

        typical(
            [[BigInt, Number], [["!", String]]],
            (num, notString) => [num, notString]
        ),

        typical(
            [[[BigInt], [Number]]],
            numbers => numbers
        )
    ]);


    test("()", () => {
        expect(func()).toBe(true);
    });
    
    test("(Number, String)", () => {
        expect(func(1, "a")).toBe([1, "a"]);
    });

    test("([Number])", () => {
        expect(func([1, 2])).toBe([1, 2]);
    });

    test("( DUCK : { name: String, score: Number })", () => {
        expect(func({
            name: "langyo",
            score: 233
        })).toBe({
            name: "langyo",
            score: 233
        })
    });

    test("(BigInt | Number, !String)", () => {
        expect(func(233, 233)).toBe([233, 233]);
        expect(func(new BigInt(233), 233)).toBe([new BigInt(233), 233]);
        expect(func(233, /233/)).toBe([233, /233/]);
        expect(func(new BigInt(233), /233/)).toBe([new BigInt(233), /233/]);
        expect(func(233, "123123")).toThrow();
        expect(func(new BigInt(233), "123123")).toThrow();
    });

    test("([BigInt | Number])", () => {
        expect(func([new BigInt(233), new BigInt(233333)])).toBe([new BigInt(233), new BigInt(233333)]);
    });
})




