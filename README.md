# otfunc

（全称 Override and strong Type FUNCtions）

这是一个用于为 JavaScript 开发的工具库，用于实现运行时的函数重载与强类型推断。

## 例子

```javascript
const { override, typeful, Types } = require(otfunc;

const func = override([
  // 演示最基本的函数重载。
  () => console.log("无类型推断，无参数"),

  (a, b) => console.log("无类型推断，有两个参数：", a, b),

  // 演示带有类型限定的一部分函数重载。
  typeful([], () => console.log("带类型推断，无参数")),

  typeful(
    [Number, String],
    (n, s) => console.log("带类型推断，参数为数字", n, "与字符串", s)
  ),
  
  typeful(
    [[Number]],
    arr => console.log("带类型推断，传入一个数字数组：", arr)
  ),

  typeful(
    [{
      name: String,
      score: Number
    }],
    obj => console.log("带类型推断，传入一个鸭子类型的对象，限定了传入的参数对应的对象必须包含哪些键、类型必须为什么：", obj)
  ),

  typeful(
    [[BigInt, Number], [["!", String]]],
    (num, notString) => console.log(
      "带类型推断，",
      "第一个参数既可以是普通数字，也可以是内置的大数类型：", num,
      "第二个参数则保证不是字符串：", notString
    )
  ),

  typeful(
    [[[BigInt], [Number]]],
    numbers => console.log("带类型推断，这次为复合类型，允许你传入一个数字数组或一个大数数组：", numbers)
  )
]);
```
