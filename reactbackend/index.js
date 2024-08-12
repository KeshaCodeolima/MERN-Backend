require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const collation = require('./Database');


const app = express();
app.use (cors());
app.use(express.json());


mongoose.connect(process.env.mongouri ,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(()=>{
    console.log("DataBase Connected Succesful");
}).catch((err)=>{
    console.log(err);
});

app.post('/register',(req, res)=>{
    const{name,email,phonenumber,password}=req.body;
    bcrypt.hash(password,10)
    .then(hash=>{
        collation.create({name,email,phonenumber,password:hash})
        .then(user => res.json(user))
        .catch(err=> res.json(err))
    })
    .catch(error=>console.log(error))
});

app.post('/login',(req,res)=>{
    
    const {email,password}= req.body;
    collation.findOne({email:email})
    .then(user=>{
        if (user) {
            bcrypt.compare(password, user.password, (error,response) => {
                if (response) {
                    res.json('Succesful Login')
                }else{
                    res.json('login Error')
                }
            })
        }else{
            res.json("no data found")
        }
    })
});

app.post('/adminlogin',(req,res)=>{

    const {email,password}= req.body;
    if (email === process.env.Adminemail) {
        collation.findOne({email:process.env.Adminemail})
    .then(user=>{
        if (user) {
            bcrypt.compare(password, user.password,(err,response)=>{
                if (response) {
                    res.json('Succesful Login')
                }else{
                    res.json('login Error')
                }
            })
        }else{
            res.json("no data found")
        }
    })
    } else {
        res.json("Invalid Email Input")
    }
});

const sendemail = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"kulasekarakeshan41@gmail.com",
        pass:"sqec jkhk oldb atpz"
    }
});
app.post('/sendemail',(req,res)=>{
   const {email} = req.body;
   collation.findOne({email:email})
   .then(user=>{
    if (user) {
        sendemail.sendMail({
            from:"kulasekarakeshan41@gmail.com",
            to: email,
            subject:"FRIST TESTING MAIL",
            text:"http://localhost:3000/forgetpage"
        },(err)=>{
            if (err) {
                res.json("Email is not sent beacuse of "+ err)
            } else {
                res.json("Email send Successfully")
            }
        })
    }else {
        res.json("The Email Not Found");
    }
   })
});


app.post('/update-password',(req, res) => {
    const { email,newPassword } = req.body;

    collation.findOne({email:email})
    .then(async user=>{
        if (user) {
            if (user.email===email) {
                const hashedpassword = await bcrypt.hash(newPassword,10)
                user.password = hashedpassword
                await user.save();
                res.json("Password Update Successfully")
            } else {
                res.json("User not found")
            }
        }
    })
    .catch(err=>console.log(err))
  });

app.get('/userdetails',async(req,res)=>{
    
    try {
        const users = await collation.find();
        res.json(users)
    } catch (error) {
        res.json(error)
    }
});

app.delete('/userdetails/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const result = await collation.findOneAndDelete({ email: email });
        if (result) {
            res.json({ alert: 'User deleted successfully' });
        } else {
            res.status(404).json({alert: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ alert: error.message });
    }
});

app.listen(3001,()=>{
    console.log("Sever is Running on");
});