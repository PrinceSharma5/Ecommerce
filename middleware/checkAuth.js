function checkAuth(req,res,next){
    if(req.session.isLoggedIn && req.session.isVarified){
        next()
        return
    }
    else {
        res.render("notverified");
        return
    }
    res.redirect("/login");
}


module.exports=checkAuth;