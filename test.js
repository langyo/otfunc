import { override } from './main';

console.log("开始测试");

const funcBasic = override([
    // 演示最基本的函数重载。
    () => true,

    (a, b) => [a, b]
]);

console.log("无参数");
funcBasic();
