module.exports=function(app){

	app.get('/',function(req,res){
		var body = '';
		var url  = "http://localhost:3000/";
		res.render('index.html',{title:'Apa atuh',content:'Ini content',url:url});
	});

	app.post('/about',function(req,res){
		var username = req.body.user;
		var password = req.body.pass;
		res.render('about.html',{user:username,pass:password});
		// console.log(req);
		// res.end('done');
	});
}

