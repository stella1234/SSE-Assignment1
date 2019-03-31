var express=require('express')
var app=express()
var hbs=require('express-handlebars') 
var path=require('path')
var Downloader = require("filedownloader");
var fs = require("fs");
var array = require('array');
const User = require('./models/pp_user.model.js'); 
const Counterr = require('./models/counter.model.js'); 
const mongoose = require('mongoose');

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
 

app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))

app.get('/',function(req,res){


    res.render('index',{

        head:"Hello World !",
        body:{
            main_para_head:"Hello There !",
            main_para:"This is an empty NodeJS and ExpressJS app with Handlebars . You can use it to quickly start building apps on top of it ."
            
        }

    })


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
app.post('/addUser',function(req,res)
{

    /***
     *    extra: String,
    id: String,   
    name : String, 
    group : String,  

     */
    
    if(isValid(req.name) && isValid(req.group))
    {
        User.find({name:req.name},function(err,data)
        {
            if(err)
            {
                res.send(err)
                return
            }
            if(data!==null && data!==undefined && data.length>0)
            {
                res.send({message:"User already exists",user:data})
            }
            else
            {
                updateCount(function(id)
                {
                    var userTask=new User({name:req.name,group:user.group,id:id})
                    userTask.save() 
                    .then(user => {
                      
                        User.findOne({id:id},function(err,data)
                        {
                            if(data)
                            {
                                res.send({message:"Created success",user:data})

                            }
                            else
                            {
                                res.send({message:"Err creating user"})

                            }
                        })
                        
                         
                    }).catch(err => {
                        res.send(err)
                    });  

                })
            }
        })
    }
    else
    {
        res.send({message:"Invalid prameters , name or group "})
    }


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

 
app.listen('8080',function(){
    console.log('Server Started');
})


