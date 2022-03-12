const fs=require("fs")
module.exports=function(path,data,callback){
    fs.writeFile(path,data,callback);
}