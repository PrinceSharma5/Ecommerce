const fs=require("fs");
module.exports=function(path,callback){
    fs.readFile(path,"utf-8",callback);
}