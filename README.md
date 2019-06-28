# otfunc

**Override and Typical Functions**

这是一个用于为 JavaScript 开发的工具库，用于实现运行时的函数重载与强类型推断。

现在正在施工🚧，一星期内会录入完成所有核心算法。

## Example
```javascript
import { override, typical, Types } from otfunc;

const func = override([
  typical([], () => console.log("没有参数")),
  typical(
    [Number, String],
    (n, s) => console.log("数字", n, "字符", s)
  ),
  // 待补充
)];
```
