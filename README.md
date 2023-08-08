# JS方法重写

## 重写call

- 实现思路
     1. 对于一个方法来说，谁调用它，方法内部的this就默认指向谁
     2. myCall方法的第二个参数及其以后都是外部函数执行时需要的参数
     3. 利用eval()可以执行字符串的方法执行外部函数

```js
const utilsModules = (function (Function) {
  /**
   * 重写call方法
   * 1. 对于一个方法来说，谁调用它，方法内部的this就默认指向谁
   * 2. myCall方法的第二个参数及其以后都是外部函数执行时需要的参数
   * 3. 利用eval()可以执行字符串的方法执行外部函数
   * @param {*} context 上下文，外部传入的指定this,应该保证其是一个object
   * @param  {...any} args 除去this后的参数
   */
  Function.prototype.myCall = function (context) {
    // 1.保证context是一个对象
    context = context ? Object(context) : window;
    // 2.这里的this就是外部调用myCall的方法
    context.originFun = this;
    // 3.获取第二个及其以后的参数
    let args = []
    for(let i=1;i<arguments.length;i++){
        // 注意添加参数需要用字符串的形式拼接进去
        // 这样eval执行时能读取到arguments[i]对应的值
        args.push('arguments['+ i +']')
    }
    console.log(args);
    // 4.利用eval执行函数,并用变量接收外部函数执行后的返回值将其返回
    let res = eval('context.originFun('+ args +')')
    // 上面句等价于eval('context.originFun(arguments[1],arguments[2])')
    
    // 5.执行完后删除originFun
    delete context.originFun
    // 6.中转外部函数执行的结果并将其返回，使其return生效
    return res
  };
})(Function);
export default utilsModules;
```


