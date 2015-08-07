var express		= require('express');
var bodyParser 	= require('body-parser');
var http 		= require('http');
var session 	= require('express-session'); 
var datetime 	= require('./include/date.js');
var app			= express();
var db 			= require('mongoskin').db("mongodb://localhost:27017/nodeapp");
var admindb 	= db.collection('admin');
var productdb 	= db.collection('product');
var route 		= express.Router();
var ObjectID 	= require('mongodb').ObjectID;

// var bootstrap 	= require('bootstrap');

// var main = require('./router/main')(app);
app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile);
app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.json());
app.use(session({secret: 'nodeapp',
    			name: 'nodeapp',
    			proxy: true,			
    			resave: true,
    			saveUninitialized: true}));
// app.use(app.router);
// app.use('/',main);

app.use(bodyParser.urlencoded({extended:true}));
var sess;
app.get('/',function(req,res){
	if(session.login == true){
		res.redirect('/admin');
	}
	sess = req.session;
	var login = sess.login;
	if(login){
		res.redirect('/admin');
	}else{
		var body = '';
		var url  = "http://localhost:3000/";
		res.render('index.html',{title:'Apa atuh',content:'Ini content',url:url});	
	}
	
});

app.post('/about',function(req,res){
	var username = req.body.user;
	var password = req.body.pass;
	// res.render('about.html',{user:username,pass:password});
	// console.log(req);
	res.json({'user':username,'pass':password});
});

app.post('/login',function(req,res){
	var username = req.body.user;
	var password = req.body.pass;
	admindb.count({'username':{$eq:username},'password':{$eq:password}},function(err,count){
		
		console.log(count);
		if(count==1){
			req.session.login 		= true;
			req.session.username 	= username;
			res.json({'status':true});
		}else{
			res.json({'status':false});
		}
		//res.status(200).end(count);
	});
	// var get_username = db.collection('admin').findOne({username:username,password:password});
	// console.log(get_username);
	// res.end('done');
	admindb.close();
});
// function logErrors(err, req, res, next) {
// 	console.error(err.stack);
//   	next(err);
// }

app.get('/admin',function(req,res){
	
	var date = datetime.tanggal();
	console.log(date);
	var arr_id 			= [];
	var arr_nama_produk = [];
	var arr_harga 		= [];
	var arr_stock 		= [];
	var arr_berat 		= [];
	var arr_date_insert = [];
	var arr_date_update = [];
	var data = productdb.find().toArray(function(err,result){
		for (var i=0;i<result.length;i++){
			arr_id.push(result[i]._id); 
			arr_nama_produk.push(result[i].nama_produk);
			arr_harga.push(result[i].harga);
			arr_stock.push(result[i].stock);
			arr_berat.push(result[i].berat);
			arr_date_insert.push(result[i].date_insert);
			arr_date_update.push(result[i].date_update); 
			// console.log(result[i].nama_produk);	
		}
		// return arr_id;
		console.log(arr_nama_produk);
		var opt = {'active':'active',
			   'content':'dashboard/dashboard.html',
			   'id':arr_id,
			   'nama_produk':arr_nama_produk,
			   'harga':arr_harga,
			   'stock':arr_stock,
			   'berat':arr_berat,
			   'date_insert':arr_date_insert,
			   'date_update':arr_date_update
			}
		if(session.login){
			res.redirect('/');
		}else{
			res.render('template.html',opt);	
		}
		
	});
	// arr_nama_produk.push('2323');
	
	productdb.close();	
});

app.get('/produk/add',function(req,res){
	
	var nama_produk = "";
	var stock 		= "";
	var harga 		= "";
	var berat 		= "";
	var data = {'nama_produk':nama_produk,
				'stock':stock,
				'harga':harga,
				'berat':berat,
				'content':'dashboard/form-dashboard.html'
				};
	if(session.login){
		res.redirect('/');
	}else{
		res.render('template.html',data);	
	}
	
});

app.post('/produk/add/do',function(req,res){
	var nama_produk = req.body.nama_produk;
	var stock 		= req.body.stock;
	var harga 		= req.body.harga;
	var berat 		= req.body.berat;
	var date_insert = datetime.tanggal();
	var date_update = "";
	var ins 		= {nama_produk:nama_produk,
					  stock:stock,
					  berat:berat,
					  harga:harga,
					  date_insert:date_insert,
					  date_update:date_update
					}
	console.log(ins);
	productdb.insert(ins,function(err,result){
		if(err) throw err;
		if(result) res.redirect('/admin');
	});
});

app.get('/produk/update',function(req,res){

	var id = req.query.id;
	// console.log(id);
	// var objectId = new ObjectID();
	var newObj 	 = ObjectID.createFromHexString(id);
	console.log(newObj);
	// res.end('done');
	// next();
	// console.log(db.ObjectID);
	productdb.find({_id:ObjectID.createFromHexString(id)}).toArray(function(err,result){
		// console.log(result);
		var data = {
				'id':result[0]._id,
				'nama_produk':result[0].nama_produk,
				'stock':result[0].stock,
				'harga':result[0].harga,
				'berat':result[0].berat,
				'content':'dashboard/form-dashboard-edit.html'
				};
		if(session.login){
			res.redirect('/');
		}else{
			res.render('template.html',data);	
		}
		
	});
});

app.post('/produk/update/do',function(req,res){
	var id 			= req.body.id;
	var nama_produk = req.body.nama_produk;
	var stock 		= req.body.stock;
	var harga 		= req.body.harga;
	var berat 		= req.body.berat;
	var opt_update  = {$set:{'nama_produk':nama_produk,'stock':stock,'harga':harga,'berat':berat}};
	productdb.update(({'_id':ObjectID.createFromHexString(id)}),opt_update,function(err,result){
		if(err) throw err;
		console.log(result);
		res.redirect('/admin');
	});


});

app.get('/delete',function(req,res){
	var id = req.query.id;

	productdb.remove({"_id":ObjectID.createFromHexString(id)},{justOne:true},function(err,result){
		if(err) throw err;
		console.log(result);
		res.redirect('/admin');
	});
});
//Customer 
app.get('/customer',function(req,res){
	if(session.login){
		res.redirect('/');
	}
	var opt = {'content':'customer/list.html'}
	res.render('template.html',opt);
});

app.get('/customer',function(req,res){
	if(session.login){
		res.redirect('/');
	}
	var opt = {'content':'customer/list.html'}
	res.render('template.html',opt);
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect('/');
		}
	});
});

//Server Run
var server=app.listen(3000,function(){
	console.log("Started listen port 3000");
});
module.exports = app;