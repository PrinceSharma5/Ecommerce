const express=require("express");
const fs=require("fs");
const app=express();
const port=3000;
const getUsers=require("./methods/getUsers");
const saveUser=require("./methods/saveUser");
const writeFile=require("./util/writeFile");
const readFile=require("./util/readFile");
var session = require('express-session')
app.use(express.urlencoded({extended:true}));
app.use(express.static("uploads"));
app.set("view engine","ejs");
let checkAuth=require("./middleware/checkAuth");
let sendEmails=require("./methods/sendEmails");
let sendEmailsForPasswords=require("./methods/sendEmailsForPasswords");
const multer=require("multer");
var storage = multer.diskStorage({
	destination: function (request, file, callback) {
	  callback(null, './uploads');
	},
	filename: function (request, file, callback) {
	  console.log(file);
		let l=-1*file.originalname.length
	    file.originalname= file.originalname.slice(l,-4)
		console.log(file);
	  callback(null, file.originalname)
	}
  });
  
const upload=multer({storage:storage});

const { errorMonitor } = require("events");
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
  }))


  

app.get("/",function(req,res){
	res.render("root");
});

app.post("/addImages",upload.array("temp_image",5),function(req,res){
 
   console.log(req.files)
      writeFile("./images.txt",JSON.stringify(req.files),function(err){
	   res.render("uploadsuccess")
   })
})

app.route("/login").get(function(req,res){
	res.render("login",{error:""});
}).post(function(req,res){
	let {username,password}=req.body;
	//console.log(req.body)

   getUsers(function(err,users){
		if(err){
			res.render("login",{error:"Error occured Please try again later"});
			return;
		}
		
		
		for(let i=0;i<users.length;i++){
			let user=users[i];
			if(user.username===username && user.password===password){
				req.session.isLoggedIn=true;
				req.session.user=user
				req.session.isVarified=user.isVarified
				res.redirect("/home");
				return;
			}
		}

		
			 res.render("login",{error:"Please signup first"});
		 
	
	})

})

app.get("/addMoreProducts",function(req,res){
	let products=[]
	var img=[]
	var imgs=fs.readFileSync("./images.txt","utf-8")
	if(imgs.length>0){
	   img=JSON.parse(imgs)
	}
	readFile("./products.txt",function(err,dataa){
	  if(err){
		  res.render("error",{error:"Error occured"})
		  return
	  }
	  if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
		  products=JSON.parse(dataa)
	  }
	  res.render("addMoreProducts",{products,url:img})
	})
	
})
app.post("/addMoreProducts",function(req,res){
	let {productName,productPrice,productQuantity,productDiscr}=req.body
	let newProduct={
		name:productName,
		price:productPrice,
		quantity:productQuantity,
		discription:productDiscr
	}
	var img=[]
	var imgs=fs.readFileSync("./images.txt","utf-8")
	if(imgs.length>0){
	   img=JSON.parse(imgs)
	}
	readFile("./products.txt",function(err,data){
        if(err){
			res.render("error",{error:"Error occured"})
		}
		let products=[]
		if(data.length>0 && data[0]==="[" && data[data.length-1]==="]"){
			products=JSON.parse(data)
		}
        products.push(newProduct)
		writeFile("./products.txt",JSON.stringify(products),function(err){
			if(err){
				res.render("error",{error:"Error occured"})
			}
			res.render("addMoreProducts",{products:products,url:img});
			return
		})
          return
	  })
})

app.get("/verify/:token",function(req,res){
	const {token}=req.params;
	getUsers(function(err,users){
		if(err){
			res.render("error",{error:" 😊 error try again"})
			return
		}
		for(let i=0;i<users.length;i++){
            let user=users[i]
			if(user.token===parseInt(token)){
				if(req.session.user){
				   req.session.isVarified=true;
				   users[i].isVarified=true;
				   writeFile("./data.txt",JSON.stringify(users),function(err){
					   if(err){
					   res.render("signup",{error:"something went wrong try again"});
					   return;
				       }
		
				       res.redirect("/home")
				       return
			        })  
					return
		        }
			    
			    req.session.isLoggedIn=true;
				req.session.user=user;
				req.session.isVarified=true;
				users[i].isVarified=true;
				writeFile("./data.txt",JSON.stringify(users),function(err){
						if(err){
						res.render("signup",{error:"something went wrong try again"});
						return;
					    }
			        
					    res.redirect("/home")
					    return
				})
				
				
				return
	        }
        }
		res.render("verifyuser",{error:" 😊 user not found please sign up again"})
        return
	
    })
})

app.route("/forgotpassword").get(function(req,res){
	res.render("forgot",{mailsent:""})
}).post(function(req,res){
	const {email}=req.body
	readFile("./data.txt",function(err,data){
		if(err){
			res.render("error",{error:"Error Occured"})
			return;
		}
		let users=JSON.parse(data)
		let flag=true
		users.forEach(function(user){
			if(user.email===email){
				flag=false
               const token=user.token
				sendEmailsForPasswords(email,token,function(err,data){
					if(err){
						res.render("error",{error:"Error Occured"})
					}
					
					res.render("forgot",{mailsent:"Mail sent"})
					return
				})
			}
		})
        if(flag)
		res.render("forgot",{mailsent:"email does not exists"});
		return
	})
})



app.get("/changepassword/:token",function(req,res){
       const {token}=req.params
	   readFile("./data.txt",function(err,data){
		   if(err){
			   res.render("error",{error:"Error occured"})
		   }
		   const users=JSON.parse(data)
		   let flag=true
		   users.forEach(function(user){
			   if(user.token===parseInt(token)){
				   flag=false
                  res.render("passwordchanges",{token,alertt:"",passwordchng:""})
				  
			   }
		   })
		   if(flag)
		   res.send("Boy u cant hack us")
	   })
})

app.post("/passwordchanges",function(req,res){
	const {tokenn}=req.query
	const {newPassword,confirmpassword}=req.body
	if(newPassword===confirmpassword){

	readFile("./data.txt",function(err,data){
		let users=JSON.parse(data)
	    for(let i=0;i<users.length;i++){
			if(users[i].token===parseInt(tokenn)){
				users[i].password=newPassword
			}
		}
		writeFile("./data.txt",JSON.stringify(users),function(err){
			res.render("passwordchanges",{token:tokenn,alertt:"",passwordchng:"Password changes successfully"})
			return
		})
	})
	return
}
     res.render("passwordchanges",{token:tokenn,alertt:"Password not matches",passwordchng:""})
})

app.route("/signup").get(function(req,res){
	res.render("signup",{error:""});
}).post(function(req,res){
   console.log(req.body);
   let {name,username,email,password}=req.body;
   if(!name || !username ||!email || !password){
	   res.render("signup",{error:"Something missing there in fields"});
	   return
   }
    
   let user={
	name,
	username,
	email,
	password,
	isVarified:false,
	token:Date.now()
   }

   saveUser(user,function(err){
	  if(err){
		  res.render("signup",{error:err});
		  return;
	  }

	  sendEmails(email,user.token,function(err,data){
		console.log(err, data);
		if(err){
			res.render("signup",{error:"Mail not sent try again"});
			return;
			
		}
		req.session.isLoggedIn=true;
	    req.session.user=user;
	    res.redirect("/home");
	})

  })

})


app.post("/addtocart",function(req,res){
      const {id}=req.query
	  let products=[]
	var dataa=fs.readFileSync ("./products.txt","utf-8")
      
		if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
			products=JSON.parse(dataa)
		}
	  readFile("./cart.txt",function(err,data){
		  if(err){
			  res.render("cart",{error:"Error occured try again later"})
		  }
		 
		  let cartData=JSON.parse(data)
		  let {username}=req.session.user;
		  let flag=true;
		  
		  if(cartData[username]){
			  if(cartData[username][id]){
				  let newQuantity=cartData[username][id].quantity + 1;
				  products.forEach(function(product){
					  if(product.name==id){
						  if(product.quantity<newQuantity){
							  flag=false;
						  }
					  }
				  })
				  cartData[username][id].quantity=newQuantity; 
			  }
			  else{
				  cartData[username][id]={
					  quantity:1,
					  id:id
				  }
			  }
		  }
		  else{
			  cartData[username]={}
			  cartData[username][id]={
				  quantity:1,
				  id:id
			  }
			  
		  }
		  if(flag){
		      writeFile("./cart.txt",JSON.stringify(cartData),function(err){
			      if(err){
				       res.render("cart",{error:"Error occured"})
			       }
                 res.redirect("/home");
     		  })
			}
			else{
				res.redirect("/home")
			}	   
	  })
})
app.post("/deleteproduct",function(req,res){
	const {key}=req.query;
	let products=[]
	var img=[]
	var imgs=fs.readFileSync("./images.txt","utf-8")
	if(imgs.length>0){
	   img=JSON.parse(imgs)
	}
	var dataa=fs.readFileSync ("./products.txt","utf-8")
      
		if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
			products=JSON.parse(dataa)
		}
		for(var i=0;i<products.length;i++){
			if(products[i].name===key)
			products.splice(i,1);

		}
		writeFile("./products.txt",JSON.stringify(products),function(err){
			res.render("adminhome",{user:req.session.user,products,url:img});
			return
		})

})
app.post("/deleteproductfromcart",function(req,res){
	const {key}=req.query
	readFile("./cart.txt",function(err,data){
		if(err){
			res.send("error")
		}
		let cartData=JSON.parse(data)
		const {username}=req.session.user
		delete cartData[username][key]
		writeFile("./cart.txt",JSON.stringify(cartData),function(err){
            if(err){
				res.send("error")
			}
			res.redirect("/gotocart")
		})
	})
})

app.get("/home",checkAuth,function(req,res){
	let products=[]
	var img=[]
	var imgs=fs.readFileSync("./images.txt","utf-8")
	if(imgs.length>0){
	   img=JSON.parse(imgs)
	}
	
	var dataa=fs.readFileSync ("./products.txt","utf-8")
      
		if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
			products=JSON.parse(dataa)
		}
		const {username}=req.session.user
	if(username==="admin"){
	console.log(img)
		res.render("adminhome",{user:req.session.user,products,url:img});
		return
	  }
	
	
    
  readFile("./cart.txt",function(err,data){
	  if(err){
		  res.render("error",{error:"SomeThing Went Wrong"})
		  return
	  }
	  let cartData=JSON.parse(data)
	  const {username}=req.session.user
	  const cart=cartData[username] || {}
	 
	
	  res.render("home",{user:req.session.user,products,cart,url:img});
  })
})

app.post("/minuscart",function(req,res){
     const {key}=req.query
	 let products=[]
	 var dataa=fs.readFileSync ("./products.txt","utf-8")
	   
		 if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
			 products=JSON.parse(dataa)
		 }
	 readFile("./cart.txt",function(err,data){
		 if(err){
			 res.send("error occured")
		 }
		 const cartData=JSON.parse(data)
		 const {username}=req.session.user
		 const cart=cartData[username] || {}
		
		 products.forEach(function(product){
			 if(product.name===key){
				 if(cart[key].quantity>1)
				 cartData[username][key].quantity--;
			 }
		 })
		 writeFile("./cart.txt",JSON.stringify(cartData),function(err){
			 if(err){
				 res.send("error occured")
			 }
              res.redirect("/gotocart")
		 })
	 })
})


app.post("/pluscart",function(req,res){
	const {key}=req.query
	let products=[]
	var dataa=fs.readFileSync ("./products.txt","utf-8")
      
		if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
			products=JSON.parse(dataa)
		}
	readFile("./cart.txt",function(err,data){
		if(err){
			res.send("error occured")
		}
		const cartData=JSON.parse(data)
		const {username}=req.session.user
		const cart=cartData[username] || {}
		
		products.forEach(function(product){
			if(product.name===key){
				if(cart[key].quantity==product.quantity)
				cartData[username][key].quantity=cartData[username][key].quantity;
				else
				cartData[username][key].quantity=cartData[username][key].quantity + 1;
			}
		})
		writeFile("./cart.txt",JSON.stringify(cartData),function(err){
			if(err){
				res.send("error occured")
			}
			 res.redirect("/gotocart")
		})
	})
})


app.get("/gotocart",function(req,res){
	let products=[]
	var img=[]
	var imgs=fs.readFileSync("./images.txt","utf-8")
	if(imgs.length>0){
	   img=JSON.parse(imgs)
	}
	var dataa=fs.readFileSync ("./products.txt","utf-8")
      
		if(dataa.length>0 && dataa[0]==="[" && dataa[dataa.length-1]==="]"){
			products=JSON.parse(dataa)
		}
	readFile("./cart.txt",function(err,data){
		if(err){
			res.send("error")
			return
		}
		let cartData=JSON.parse(data)
		const {username}=req.session.user
		var cart=cartData[username] || {}
		var lengths=20
		var temp=[]
		while(lengths--){
		if(Object.keys(cart).length != 0){
			console.log(Object.keys(cart).length)
			for(let keyy in cart){
			
				var flag=0
				for(var i=0;i<products.length;i++){
					if(keyy!=products[i].name){
					
						continue;
					}
					flag=1
					break;
				}
				if(flag==0){
                temp.push(keyy)
					
					
					break;
				}
			}
		}
	} 
	let newTemp = [...new Set(temp)];
	
	for(var i=0;i<newTemp.length;i++){
		delete cart[newTemp[i]];
	}
	
		res.render("cart",{user:req.session.user,products,cart,url:img});
	})
})


 app.get("/logout",function(req,res){
	 req.session.destroy();
	 res.redirect("/");
 })
app.get("*",function(req,res){
	res.render("error",{error:"404 error"});
})


app.listen(port,function(){
	console.log(`server running at port ${port}`);
})
