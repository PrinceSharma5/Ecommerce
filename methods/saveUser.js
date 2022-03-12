const getUsers=require("./getUsers");
const writeFile=require("../util/writeFile")
 module.exports=function(newUser,callback){
     getUsers(function(err,users){
        
         if(err){
             callback("Error occured please try again later")
             return
         }
         for(let i=0;i<users.length;i++){
             let user=users[i]
             if(user.username===newUser.username){
                 callback("Username already exists")
                 return
             }
           if( user.email===newUser.email){
                 callback("Email already exists")
                 return
             }
         }
         users.push(newUser);
        writeFile("./data.txt",JSON.stringify(users),function(err){
             if(err){
                 callback("Something wrong happens try again");
                 return
             }
             callback(null);
             return
         })
     }
 )
}
