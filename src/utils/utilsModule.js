const utilsModules = (function(Function){
    /**
     * 重写Call方法
     */
    Function.prototype.myCall = function(){
        console.log('myCall');
    }
})(Function)
export default utilsModules