var express		= require("express");
var app			= express();
var http		= require("http").Server(app);
var engine		= require("ejs-locals");
var fs			= require("fs");
var mysql 		= require('mysql'); 
var bodyParser 	= require('body-parser');
var url 		= require('url');
var multer 		= require('multer');
var path 		= require('path');
var Promise 	= require('promise');

//var upload 		= multer({ dest: 'uploads/' })
//var upload 		= multer();
//var type 		= upload.single('img');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// for parsing multipart/form-data
//app.use(upload.single('img')); 
//app.use(express.static('public'));

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
		//console.log(req.body.sname)
		var fname = file.originalname.split('.')
		callback(null, req.body.sname+'-'+fname[0] + '-' + Date.now() + path.extname(file.originalname))
	}
})

var upload = multer({
				storage: storage,
				fileFilter: function(req, file, callback) {
					var ext = path.extname(file.originalname)
					if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
						return callback(res.end('Only images are allowed'), null)
						//return callback(console.log('Only images are allowed'), null)
					}
					callback(null, true)
				}
				}).array('img')


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database : 'student'
});


con.connect(function(err) {
  if (err) throw err;
  
});

app.get('/add',function(req,res){
	res.render('add');
})

app.post('/addAction',upload,function(req,res,next){
	
	
	console.log(req.body)
	if(req.method == "POST") {
		var sname = req.body.sname;
		if(sname == "") {
			process.stdout.write("please enter student name");
		} else {
			
			sname 		= req.body.sname
			
			var img;
			console.log(req.files)
			if(req.files.length > 0) {
				img   	= req.files[0].filename;
				upload(req, res, function(err) {
					//res.end('File is uploaded')
					if (err) throw err;
					console.log("image uploaded successfully");
				})
			} else {
				img  = null;
			}
			var sql = "INSERT INTO persons (`Id`,`sname`,`img`) VALUES (null,'"+sname+"','"+img+"')";
						
			con.query(sql, function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");
				res.redirect('/');
			 })
		}
	}
})

app.get('/edit/:id',function(req,res){
	
	var id = req.params.id;
	var sql = "SELECT * FROM persons WHERE Id="+id;
	console.log(sql);
	
	var data;
	con.query(sql,function(err,result){
		if(err) throw err;
		res.render('edit',{data:result});
	})
	
})

app.post('/editAction',upload,function(req,res){
	var sname = req.body.sname;
	var id = req.body.Id;

	var img = '';
	
	if(sname == "") {
		process.stdout.write("please enter student name");
	} else {
	
		var sql = "UPDATE persons SET sname ='"+sname+"' ";					  
		if(req.files.length > 0) {
			img   	= req.files[0].filename;
			
			
		} 
		upload(req, res, function(err) {
			//res.end('File is uploaded')
			if (err) throw err;
			console.log("image uploaded successfully");
			if(img != ''){
				sql += ", img ='"+img+"' ";
			}
			sql += " WHERE Id='"+id+"'";
			
			con.query(sql, function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");
				res.redirect('/');
			 })
	
		})
		

		
		
	}	
	
	//console.log("+++++++++++"+img)
		
		
		
	
})


app.get('/delete/:id',function(req,res){
	
	var id = req.params.id;
	console.log(id);
	
	con.query("SELECT img FROM persons WHERE Id='"+id+"'", function (err, result) {
		if (err) throw err;
		fs.unlinkSync(__dirname+ '/uploads/'+result[0]['img']);		
	})
	
	var sql = "DELETE FROM persons WHERE Id ="+id;
	con.query(sql,function(err){
		if (err) throw err;
		console.log("1 record deleted");
	});
	res.redirect('/');
})

app.get('/',function(req, res){
	
	 var output;
	con.query("SELECT * FROM persons", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		res.render('list',{data:result});
			
	});
	 
	
})

app.set("views",__dirname+"/views");
app.set('uploadDir', __dirname + '/uploads');
app.use(express.static(__dirname + '/uploads'));
app.engine('ejs', engine);
app.set("view engine", "ejs");


http.listen(7000,function(request,response){
	console.log("welcome");
})