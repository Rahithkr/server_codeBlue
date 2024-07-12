import userCollection from "../Models/userModel.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateOtp,sendOtpEmail } from "../utils/otp.js";
import Stripe from 'stripe'

import dotenv from 'dotenv'

dotenv.config()




const signup = async (req, res, next) => {
  const { username, email, mobile, password } = req.body;
  const hashPassword = bcryptjs.hashSync(password, 10);
  const generatedotp = generateOtp();
  console.log('generatedotp',generatedotp);

  try {
    // Send OTP via email
    await sendOtpEmail(email, generatedotp);

    // Store user data and OTP in the database
    await userCollection.updateOne(
      { email },
      {
        username,
        email,
        mobile,
        password: hashPassword,
        otp: generatedotp,
        otpExpires: new Date(Date.now() + 1 * 60 * 1000), // OTP expires in 10 minutes
        verified: false
      },
      { upsert: true }
    );

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  console.log("email",email,"otp",otp);

  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
     console.log('user.otp',user.otp);
    if (user.otp == otp && user.otpExpires > Date.now()) {
      // Mark user as verified and clear OTP
      user.verified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const generatedotp = generateOtp();
    console.log('generatedotp',generatedotp);

    // Update user with new OTP and expiration time
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







const signin= async (req,res,next)=>{
    const {email,password}=req.body


try {
  const { email, password } = req.body;
  const user = await userCollection.findOne({ email:email });

  if (!user) {
      console.error("Invalid credentials - user not found");
      return res.status(400).json({ message: 'Invalid credentials' });
  }

  if (user.isBlocked) {
      console.error("User account is blocked");
      return res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
  }

  const isMatch = await bcryptjs.compareSync(password, user.password);

  if (!isMatch) {
      console.error("Invalid credentials - password mismatch");
      return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
  });

  res.cookie('codeBlueUser-token', token, { httpOnly: true });
  res.json({ token });
} catch (error) {
  console.error("Server error", error);
  res.status(500).send('Server error');
}


}



const forgotPassword=async(req,res)=>{
  const { email } = req.body;
  const generatedotp = generateOtp();
  console.log("generatedotp",generatedotp);
  try {
    
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    else{
      await sendOtpEmail(email, generatedotp);
      
     
      await userCollection.updateOne({ email }, {  otp: generatedotp}, { upsert: true });
      return res.status(200).json({ message: 'OTP sent successfully' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
}





const forgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
 console.log('email',email,'otp',otp);

  try {
    const user = await userCollection.findOne({ email });
   

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp == otp ) {
      user.otp = null; // Clear OTP after verification
    
      await user.save();
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};





const forgotPasswordResendOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const generatedotp = generateOtp();
    console.log('generatedotp',generatedotp);

    // Update user with new OTP and expiration time
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






const resetPassword=async(req,res)=>{
  const{email,newPassword}=req.body


  try {
    const user =await userCollection.findOne({email})
    const hashPassword=await bcryptjs.hashSync(newPassword,10)
    user.password=hashPassword
    user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
}


const googleSignin=async(req,res,next)=>{
  try {
    const {name,email}=await req.body
    console.log('google 123');
    
    
    let user = await userCollection.findOne({ email });

    if (!user) {
      user = new userCollection({
        username:name,
        email :email,
        isVerified: true,
      });
      await user.save();

   
    }  else {
      user.isVerified = true;
      await user.save();
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('tokkkkk',token);
    
    
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully.',
      token,
    });
  console.log("12345 google");
    
  } catch (error) {
    console.error('Error during Google login:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error during Google login',
    });
  }
   
}



const updateUserLocation= async (req, res) => {
 
  const { email, latitude, longitude } = req.body;
  console.log("latitude",latitude);
  console.log("longitude",longitude);

  if (!email || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Invalid request parameters' });
  }

  try {
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    user.latitude = latitude;
    user.longitude = longitude;

    await user.save();

    return res.status(200).json({ message: 'Location updated successfully', user });
  } catch (error) {
    console.error('Error updating driver location:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};




const confirmRide= async (req, res) => {
  const { email, pickupPosition, destinationPosition } = req.body;

 
console.log("email",email,"pickupPosition",pickupPosition,'destinationPosition',destinationPosition);
  try {
   
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's pickup and destination positions
    user.pickupPosition = pickupPosition;
    user.destinationPosition = destinationPosition;

    // Save the updated user document
    await user.save();

    
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserDetails = async (req, res) => {
  const { email } = req.params;
 

  try {
    const user = await userCollection.findOne({ email }, { username: 1, email: 1, mobile: 1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTripId= async (req, res) => {
  const { email, tripDetails } = req.body;
console.log("tripdid",tripDetails);
  try {
    const user = await userCollection.findOneAndUpdate(
      { email: email },
      { $push: { tripDetails: tripDetails } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated with trip ID successfully', user });
  } catch (error) {
    console.error('Error updating user with trip ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const getTripId = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (!user.tripDetails || user.tripDetails.length === 0) {
      return res.status(404).json({ message: 'No trip details found for user' });
    }


    const latestTrip = user.tripDetails[user.tripDetails.length - 1];
    const tripId = latestTrip.tripId;
   

    res.status(200).json({ tripId });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateProfile = async (req, res) => {
  const { email } = req.params;
  const updatedUser = req.body;

  try {
    const filter = { email };
    const update = updatedUser;
    const options = { new: true };

    const user = await userCollection.findOneAndUpdate(filter, update, options);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const tripHistory=async (req, res) => {
  
  const { email } = req.params;

  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tripDetails = user.tripDetails;
    if (tripDetails.length === 0) {
      return res.status(404).json({ message: 'No trip details found' });
    }

    res.status(200).json(tripDetails);
  } catch (error) {
    console.error('Error fetching trip history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
const userProfileSidebar=async (req, res) => {
  const { email } = req.params;

  try {
    const user = await userCollection.findOne({ email }, { username: 1, mobile: 1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const userProfileData=async (req, res) => {
  const { email } = req.params;
  

  try {
    const user = await userCollection.findOne({ email }, { username: 1, email: 1, mobile: 1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export {
    signup,signin,googleSignin,verifyOtp,forgotPassword,forgotPasswordOtp,resetPassword,resendOtp,forgotPasswordResendOtp,updateUserLocation,confirmRide,getUserDetails,
    updateTripId,getTripId,tripHistory,updateProfile,userProfileSidebar,userProfileData
}