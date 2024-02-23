import express from "express";
const PORT = 5000;
const app = express();
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve("./public"))));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017", { dbName: "backend" })
  .then(() => {
    console.log("db is connected ");
  })
  .catch((e) => {
    e;
  });

const mess = new mongoose.Schema({
  name: String,
  email: String,
  password:String
});

const mod = mongoose.model("users", mess);

const isauth = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decodtoc = jwt.verify(token, "aslkjdfshdas");
    
     req.userin = await mod.findById(decodtoc._id);
   
    next();
  } else {
    res.redirect("login");
  }
};

app.post("/login", async(req,res)=>{

  const {  email,password } = req.body;
  let user= await mod.findOne({email})
  if(!user) return res.redirect("register")
   
  const ismatch = await bcrypt.compare(password,user.password)
  
  if(!ismatch)return res.render("login")

  const tokenid = jwt.sign({ _id: user._id }, "aslkjdfshdas");

  res.cookie("token", tokenid, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.render("logout");
  
})

app.get("/register",(req,res)=>{
  res.render("register")
})

app.post("/register", async (req, res) => {

  const { name, email,password } = req.body;
  let user = await mod.findOne({email})
  if(user){
    res.redirect("login")
  }
  const hashedpass = await bcrypt.hash(password,10)
   user = await mod.create({ name, email ,password:hashedpass});
  const tokenid = jwt.sign({ _id: user._id }, "aslkjdfshdas");

  res.cookie("token", tokenid, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.render("logout");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", isauth, (req, res) => {
  
  res.render("logout");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.render("login");
});

app.listen(PORT, () => {
  console.log("server is listening");
});
