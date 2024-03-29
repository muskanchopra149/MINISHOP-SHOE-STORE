var express=require('express')
var ejs=require('ejs');
var bodyParser=require('body-parser');
var mysql = require('mysql');
var session=require('express-session');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb" 
});
var app=express();

app.use(express.static('public'));
app.set('view engine','ejs');

app.listen(3000);
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({secret:"secret"})) //keyvalue pairs

function isProductInCart(cart,id){ 
	for(let i=0;i<cart.length;i++){
		if(cart[i].id==id){
			return true;
		}
	}
	return false;
}
function calculateTotal(cart,req){
	total=0;
	for(let i=0;i<cart.length;i++){
	total=total+(cart[i].price*cart[i].quantity)
	}
	req.session.total=total;
	return total;
}
//localhost:3000
app.get('/',function(req,res){
	var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb" 
})
con.query("SELECT * FROM products",(err,result)=>{
	res.render('pages/shoe',{result:result});
})
});

app.post('/add_to_cart',function(req,res){
	var id= req.body.id;
	var name= req.body.name;
	var price= req.body.price;
	var quantity= req.body.quantity;
	var image = req.body.image;
	var product={id:id,name:name,price:price,quantity:quantity,image:image};
	
	if(req.session.cart){
		var cart=req.session.cart;
		if(!isProductInCart(cart,id)){
			cart.push(product);
		}
	}
	else{
		req.session.cart=[product];
		var cart=req.session.cart;
	}
	//Calculate the total
	calculateTotal(cart,req);
	
	//return to cart page
	res.redirect('/cart');
});
app.get('/cart',function(req,res){
	var cart=req.session.cart;
	var total=req.session.total;
	res.render('pages/cart',{cart:cart,total:total});	
});
app.post('/remove_product',function(req,res){
	var id=req.body.id;
	var cart=req.session.cart;
	for(let i=0;i<cart.length;i++)
	{
		if(cart[i].id==id)
		{
			cart.splice(cart.indexOf(i),1);
		}
	}
	//recalculate total
	calculateTotal(cart,req);
	res.redirect('/cart');
});
app.get('/checkout',function(req,res){
	var total=req.session.total;
	res.render('pages/checkout');
});

app.post('/place_order',function(req,res){
	var Name=req.body.Name;
	var Email=req.body.Email;
	var Address=req.body.Address;
	var City=req.body.City;
	var Phone=req.body.Phone;
	var con = mysql.createConnection({
			  host: "localhost",
			  user: "root",
			  password: "",
			  database: "mydb" 
		});
		con.connect((err)=>{
			if(err){
				console.log(err)
			}
			else{
				var query="INSERT INTO orders{Name,Email,Address,City,Phone)VALUES?";
				var values=[[Name,Email,City,Address,Phone]];
				con.query(query,[values],(err,result)=>{
					res.redirect('/payment');
				});
			}
		});
});

app.get('/payment',function(req,res){
	var total=req.session.total;
	res.render('pages/payment',{total:total})
});