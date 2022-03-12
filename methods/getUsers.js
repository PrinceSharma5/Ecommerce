const readFile=require("../util/readFile");
module.exports=function(callback){
    readFile("./data.txt",function(err,data){
        if(err){
            callback("error in reading file",null);
            return;
        }
        
            let users=[]
            if(data.length>0 && data[0]==="[" && data[data.length-1]==="]"){
            users=JSON.parse(data)
            }
            callback(null,users);
            return;
        
    })
}