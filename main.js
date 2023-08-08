import utilsModules from "./src/utils/utilsModule";
function test(){
  console.log("heihei",this);
  return '111'
}
function test1(){

}
let res = test.myCall(test1,'heihie')
console.log(res);
let arr = [1,2]
