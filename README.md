# JS部分原生方法实现

## 注意

- 由于是实现原生方法，以下实现均使用**ES5及其以下**的语法

## 实现call

- **实现思路**
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
    var args = []
    for(let i=1;i<arguments.length;i++){
        // 注意添加参数需要用字符串的形式拼接进去
        // 这样eval执行时能读取到arguments[i]对应的值
        args.push('arguments['+ i +']')
    }
    console.log(args);
    // 4.利用eval执行函数,并用变量接收外部函数执行后的返回值将其返回
    var res = eval('context.originFun('+ args +')')
    // 上面句等价于eval('context.originFun(arguments[1],arguments[2])')
    
    // 5.执行完后删除originFun
    delete context.originFun
    // 6.中转外部函数执行的结果并将其返回，使其return生效
    return res
  };
})(Function);
export default utilsModules;
```



## 实现apply

- **实现思路**
  1. 当args是数组时，不报错，length正常
  2. 当args是对象、function、null、undefined、不存在时，不报错，length为0
  3. 当args是原始值时，报类型错误：Uncaught TypeError: CreateListFromArrayLike called on non-object
- **同时重写了typeof方法，使其能检测所有类型**

```js
const utilsModules = (function (Function) {
  /**
   * 重写apply 方法
   * 1. 当args是数组时，不报错，length正常
   * 2. 当args是对象、function、null、undefined、不存在时，不报错，length为0
   * 3. 当args是原始值时，报类型错误：Uncaught TypeError: CreateListFromArrayLike called on non-object
   * @param {object} context 外部传入的指定this
   * @param {Array} args 
   */
  Function.prototype.myApply = function (context,args){
    context = context? Object(context):Window
    // 存储外部函数
    context.originFun = this
    // 处理3
    if(typeof args !== 'object' && typeof args !== 'function' && typeof args !== 'undefined'){
        delete context.originFun
        throw new TypeError("CreateListFromArrayLike called on non-object")
    }
    // 处理2 length为0只要保证执行时不传参即可
    if(!args || typeOf(args) !== 'array'){
        var res = context.originFun()
        delete context.originFun
        return res
    }
    // 处理1
    var res = eval("context.originFun("+ args +")")
    delete context.originFun
    return res
  }

  /**
   * 重写typeOf方法，使其功能完善
   * 利用了Object.prototype.toString.call(value),判断出[object String]格式的类型
   * @param {*} value 
   */
  function typeOf(value){
    return {
        "[object String]":"string",
        "[object Number]":"number",
        "[object Boolean]":"Boolean",
        "[object Null]":"null",
        "[object Undefined]":"undefined",
        "[object Object]":"object",
        "[object Function]":"function",
        "[object Array]":"array",
    }[Object.prototype.toString.call(value)]
  }

  return {
    typeOf
  }
})(Function);
export default utilsModules;
```



## 实现bind

- **实现思路**
  1. bind方法会创建一个新的函数并将其返回
  2. 在bind()被调用时，这个新函数的this就被指定为bind()的第一个参数
  3. 第二个及其以后的参数都将作为新函数的参数，供调用时使用
  4. context不用保证一定是一个object
  5. 绑定后返回的新函数被new出的实例能访问到 test 原型对象上的属性

```js
const utilsModules = (function (Function) {
  /**
   * 重写bind()方法  test1 = test.bind()
   * 1.bind方法会创建一个新的函数并将其返回
   * 2.在bind()被调用时，这个新函数的this就被指定为bind()的第一个参数
   * 3.第二个及其以后的参数都将作为新函数的参数，供调用时使用
   * 4.context不用保证一定是一个object
   * 5.绑定后返回的新函数被new出的实例能访问到 test原型对象上的属性
   * @param {any} context
   */
  Function.prototype.myBind = function (context) {
    // 保存外部函数
    var originThis = this;
    // 获取第二个及其以后参数(注意：这里的参数只是目前的，后续返回的新函数还有可能会接受到参数)
    var args = [].slice.call(arguments, 1);
    // 处理原型链（圣杯模式，防止污染原型链）
    var _tempFun = function () {};
    var _newFun = function () {
      // 获取返回的新函数接收到的参数(arguments是一个类数组，没有slice方法，不能直接arguments.slice(1))
      var newArgs = [].slice.call(arguments);
      // 将新函数接收到的参数和之前的参数args合并
      return originThis.apply(context, args.concat(newArgs));
    };
    // 处理原型链（圣杯模式，防止污染原型链）
    _tempFun.prototype = originThis.prototype;
    _newFun.prototype = new _tempFun();
    return _newFun;
  };
})(Function);
export default utilsModules;

```



## 实现new

- **实现思路**

  1. 创建一个空的简单 JavaScript 对象(即 {})；
  2. 为步骤 1 新创建的对象添加属性 __proto__，将该属性链接至构造函数的原型对象；

  3. 将步骤 1 新创建的对象作为 this 的上下文；

  4. 如果该函数没有返回对象，则返回 this

  5. 隐式原型属性内的constructor指向构造函数

```js
const utilsModules = (function (Function) {
  /**
   * 重写new (用方法得形式来代替，关键字无法模拟)
   * 1.创建一个空的简单 JavaScript 对象(即 {})；
   * 2.为步骤 1 新创建的对象添加属性 __proto__，将该属性链接至构造函数的原型对象；
   * 3.将步骤 1 新创建的对象作为 this 的上下文；
   * 4.如果该函数没有返回对象，则返回 this
   * 5.隐式原型属性内的constructor指向构造函数
   */
  function myNew(){
    // 获取构造函数(第一个参数)
    var constructor = [].shift.call(arguments)
    // 创建一个空对象
    var _this = {}
    // 为_this添加属性__proto__,并将该属性链接至构造函数的原型对象
    _this.__proto__ = constructor.prototype
    // 将_this对象作为构造函数的this上下文，并携带其余参数
    var res = constructor.apply(_this,arguments)
    // 根据构造函数执行的返回结果决定返回的内容
    return typeof res == 'object' ? res:_this
  }
    
  return {
    myNew,
  };
})(Function);
export default utilsModules;

```



## 实现instanceof

- **实现思路**
  1. instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上
  2. 对于**原始值**用 **instanceof** 判断均为 **false**

```js
const utilsModules = (function (Function) {
  /**
   * 实现 instanceof方法
   * instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上
   * 对于原始值用instanceof判断均为false
   * @param {*} instance 实例对象
   * @param {*} constructor 构造函数
   */
  function instanceOf(instance, constructor) {
    // 判断实例是否为对象
    if (typeof instance == 'object' || typeof instance == 'function') {
      while (instance.__proto__ !== null) {
        // 判断构造函数的原型对象是否在实例对象的原型链上
        if (instance.__proto__ == constructor.prototype) {
          return true;
        }
        // 后移
        instance = instance.__proto__;
      }
      return false;
    }else{
        // 原始值直接返回false
        return false
    }
    
  }

  return {
    instanceOf,
  };
})(Function);
export default utilsModules;
```







