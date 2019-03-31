var express=require('express')
var app=express()
var hbs=require('express-handlebars') 
var path=require('path')   
const User = require('./models/pp_user.model.js'); 
const Counterr = require('./models/counter.model.js'); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var KEY="test"
mongoose.Promise = global.Promise;
    
mongoose.connect("mongodb://heroku_8jt3t0fk:va9u9iq2rce8opkevdi9cj2k84@ds113873.mlab.com:13873/heroku_8jt3t0fk", {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");   
    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.engine('hbs',hbs({
    extname:"hbs"
}))
 
app.use(bodyParser.urlencoded({ extended: true })) 
//app.use(bodyParser.urlencoded())

app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))

app.all('/',function(req,res){

            
                var params={};
              if(req.body!==undefined && isValid(req.body.query))
                {
                    params=req.body
                }
                else  if(req.query!==undefined && isValid(req.query.query))
                {
                    params=req.query
                }

                var srchq={ }
                if(isValid(params.query))
                {
                     srchq.name= new RegExp(params.query, 'i')
                }

                if(isValid(params.group))
                {
                    srchq.group=new RegExp(params.group, 'i')
                }
               // console.log(srchq)
                User.find(srchq, function(err, docs){
                                    var msg=""
                                    if(docs.length<1)
                                    {
                                        msg="Can't Find your friend ? Send his/her name with a display picture to cuface.official@gmail.com , we'll add "
                                    }
                                    console.log("__",msg)
                            res.render('index',{
                                message:msg,
                                users:docs
                        
                            })
            
                });
            

 

})

var updateCount=function(cb)
{
    if(cb===undefined)
    {
        cb=function(r){};
    }
    Counterr.findOne({},function(err,count)
    {
        if(count===undefined || count===null)
        {
            var countTask=new Counterr({id:0,count:10})
           
            console.log("Creating new counter");
            countTask.save()
            .then(user => {
                Counterr.findOne({},function(err,count)
                {
                    cb(count.count);
                });
                 
            }).catch(err => {
                
            }); 
        }
        else
        {
            count.count=count.count+1;
            var myquery = {  };
            var newvalues = { $set: count };  
            Counterr.updateOne(myquery, newvalues, function(err, saveRes) {
                Counterr.findOne({},function(err,ct){
                    console.log("Count is ",ct.count);
                    cb(ct.count)
                })
   
               
            });


          

        }
    })
}



app.all('/search',function(req,res)
{

    var params={};
    if(req.body!==undefined && isValid(req.body.query))
    {
        params=req.body
    }
    else if(req.query!==undefined && isValid(req.query.query))
    {
        params=req.query
    }

    var srchq={'name' : new RegExp(params.query, 'i')}
    if(isValid(params.group))
    {
        srchq.group=new RegExp(params.group, 'i')
    }
    User.find(srchq, function(err, docs){
       
        res.send(docs)
 
    });
})



app.all('/addUser',function(req,res)
{

    /***
     *    extra: String,
    id: String,   
    name : String, 
    group : String,  

     */
    

    User.find({},function(err,users)
    {
 

    if(isValid(req.body.name) && isValid(req.body.group)  && ( isValid(req.body.key) && req.body.key
    ==KEY ))
    {


        User.find({name:req.body.name},function(err,data)
        {
            if(err)
            {
                res.render('add',err)
                return
            }
            if(data!==null && data!==undefined && data.length>0)
            {
                res.render('add',{message:"User already exists",user:data,users:users})
            }
            else
            {
                updateCount(function(id)
                {
                    var userTask=new User({name:req.body.name,group:req.body.group,id:id})
                    userTask.save() 
                    .then(user => {
                      
                        User.findOne({id:id},function(err,data)
                        {
                            if(data)
                            {
                                res.render('add',{message:"Created success , Refresh to see new user",user:data,users:users})

                            }
                            else
                            {
                                res.render('add',{message:"Err creating user",users:users})

                            }
                        })
                        
                         
                    }).catch(err => {
                        res.render('add',{message:err,users:users})
                    });  

                })
            }
        })
    }
    else
    {
        res.render('add',{message:"Invalid prameters , name or group ",users:users})
    }


    })



})

app.get('/deleteUser',function(req,res)
{

    if(req.query.key===undefined ||req.query.key!==KEY )
    {
        res.send({message:"Invalid Key"})

        return
    }
    User.findOne({id:req.query.id},function(err,user)
    {
        if(err || user===null || user===undefined)
        {
            res.send({message:"User not existe"})
        }
        else
        {
            User.deleteOne({id:req.query.id},function(err)
            {
                if(err)
                res.send(err)
                else
                res.send({message:"Deleted Success",removed_user:user})
            })
        }
    })


})
var isValid=function(str)
{
    return str!==undefined &&  str.length>1
}

var getFormattedTime=function() {
    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth();
    var d = today.getDate();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    return y + "_" + m + "_" + d + "_" + h + "_" + m + "_" + s;
}

 
app.listen(process.env.PORT  || 8080,function(){
    console.log('Server Started');
})


