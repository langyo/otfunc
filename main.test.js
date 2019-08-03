const { override, strongly, Types } = require("./main");

describe("无类型限定的函数重载", () => {
  const funcBasic = override([
    // 演示最基本的函数重载。
    () => true,

    (a, b) => [a, b]
  ]);

  test("无参数", () => {
    expect(funcBasic()).toStrictEqual(true);
  });

  test("带两个参数", () => {
    expect(funcBasic(1, 2)).toStrictEqual([1, 2]);
    expect(funcBasic("a", "b")).toStrictEqual(["a", "b"]);
  });
});


describe("带类型限定的函数重载", () => {
  const func = override([
    // 演示带有类型限定的一部分函数重载。
    strongly([], () => true),

    strongly(
      [Number, String],
      (n, s) => [n, s]
    ),

    strongly(
      [[Number]],
      arr => arr
    ),

    strongly(
      [{
        name: String,
        score: Number
      }],
      obj => obj
    ),

    strongly(
      [[BigInt, Number], [["!", String]]],
      (num, notString) => [num, notString]
    )
  ]);


  test("()", () => {
    expect(func()).toStrictEqual(true);
  });

  test("(Number, String)", () => {
    expect(func(1, "a")).toStrictEqual([1, "a"]);
  });

  test("([Number])", () => {
    expect(func([1, 2])).toStrictEqual([1, 2]);
  });

  test("( DUCK : { name: String, score: Number })", () => {
    expect(func({
      name: "langyo",
      score: 233
    })).toStrictEqual({
      name: "langyo",
      score: 233
    })
  });

  test("(BigInt | Number, !String)", () => {
    expect(func(233, 233)).toStrictEqual([233, 233]);
    expect(func(233, /233/)).toStrictEqual([233, /233/]);
  });
})




