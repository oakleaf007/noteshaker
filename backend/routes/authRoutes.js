import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser =  await User.findOne({ email });
    if(existingUser){
        return res.status(400).json({error:"Email already registered"})
    }
    const hashedPassword = await bcrypt.hash(password,10);


    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered succesfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route

router.post("/login", async (req, res) => {
    try{
        const {email, password } =req.body;
    
    const user = await User.findOne({email});
    
    if(!user){
        return res.status(400).json({ message: "user not found"});

    }else if(user && user.provider === "google"){
      return res.status(400).json({ message: "This account created with Google. Please sign in using google."});

    }

    const match = await bcrypt.compare(password, user.password);

    if (!match){
        return res.status(400).json({message: "invalid password"});

    }
  
    res.status(200).json({ message: "Login successful", user})
}
     catch (error){
        res.status(500).json({message: "Server error", error});
    }

});

// Google login


router.post("/google-login", async (req, res)=>{
  const {token} =req.body;

  try{
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const {sub,email,name} = payload;

    let user =await User.findOne({email});



    if (user && user.provider === "local") {
   return res.status(400).json({ message: "This account was created with local login method. Please sign in using password ."});
}

 if (!user) {
      // If already registered locally
      
 

      user = new User({ googleId: sub, email, name, provider: "google" });
      await user.save();
    }

   
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  }


  

  catch(err){
     console.error("Google login error:", err);
    res.status(400).json({error: "Invalid google token"});
  }
});

export default router;
