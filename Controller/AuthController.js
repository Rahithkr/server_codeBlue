import driverCollection from "../Models/driverModel.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateOtp,sendOtpEmail } from "../utils/otp.js";
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET =process.env.ADMIN_JWT_SECRET


const signup = async (req, res, next) => {
  const { drivername, email, mobile, password } = req.body;
  const hashPassword = bcryptjs.hashSync(password, 10);
  const generatedotp = generateOtp();
  console.log("generatedotp",generatedotp);

  try {
    // Send OTP via email or SMS
    await sendOtpEmail(email, generatedotp);
    
    // Store user data and OTP in the database
    await driverCollection.updateOne({ email }, { drivername, email, mobile, password: hashPassword, otp: generatedotp,otpExpires: new Date(Date.now() + 1 * 60 * 1000),verified: false }, { upsert: true });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
}

// verify OTP endpoint
const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
 
console.log("enteredOtp",otp);
  try {
    const user = await driverCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

console.log("useotp",user.otp);
    if (user.otp == otp && user.otpExpires > Date.now())  {
      // Mark user as verified and clear OTP
      user.verified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
console.log(user);
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    next(error);
  }
}


const driverResendOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await driverCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const generatedotp = generateOtp();
    console.log("resendotp",generatedotp);

   
    user.otp = generatedotp;
    user.otpExpires = new Date(Date.now() + 1 * 60 * 1000); // OTP expires in 10 minutes
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, generatedotp);

    res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};



const googleSignIn=async(req,res,next)=>{
  
  try {
    const {name,email}=await req.body
    console.log("emaildriver",email);
    
    
    const user = await driverCollection.findOne({ email });

    if (!user) {
      user = new driverCollection({
        drivername:name,
        email :email,
        isVerified: true,
      });
      await user.save();

   
    }  else {
      user.isVerified = true;
      await user.save();
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1h' });
    console.log('tokkkkk',token);
    
    
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully.',
      token,
    });
  
    
  } catch (error) {
    console.error('Error during Google login:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error during Google login',
    });
  }
   
}



const signin=async(req,res,next)=>{
    const{email,password}=req.body
   
    try {
        const validDriver=await driverCollection.findOne({email:email})
      

        if (!validDriver) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (validDriver.isBlocked) {
          return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
        }

        const isPasswordValid = bcryptjs.compareSync(password, validDriver.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

      

        // Generate JWT token
        const token = jwt.sign({ id: validDriver._id, email: validDriver.email }, JWT_SECRET, { expiresIn: '1h' });
        console.log(token)

        res.status(200).json({ message: 'Login successful', token });
  




    } catch (error) {
        console.log(error);
    }
}







// Hashing the password 'admin123'
const hashAdminPassword = async () => {
    const password = process.env.ADMIN_PASSWORD;
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
   
  };
  
  hashAdminPassword();

const adminCredentials = {
    email: process.env.ADMIN_EMAIL,
    hashedPassword: '$2a$10$a5ySoUUz699BVbsfX7ZRnOtApsE39Cdy7ApyTFQ0TVJYzgKRRUZaW' // Hashed password: admin123
  };
  
  
  const adminSignin = async (req, res, next) => {
    try {
     
      const { email, password } = req.body;
  
      console.log(email,password);
      const isPasswordValid =bcryptjs.compareSync(password, adminCredentials.hashedPassword);
 
      if (email === adminCredentials.email && isPasswordValid) {
       
        const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '1h' });
  
       
        res.status(200).json({ token: token });
      } else {
       
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (error) {
      
      next(error);
    }
  };


export{
    signup,signin,adminSignin,verifyOtp,driverResendOtp,googleSignIn
}