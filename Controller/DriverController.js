import driverCollection from "../Models/driverModel.js";
import multer from "multer";
import path from 'path'
import { generateOtp, sendOtpEmail } from "../utils/otp.js";
import bcryptjs from 'bcryptjs'
import { log } from "console";
import axios from 'axios'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Assets/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});


const upload = multer({ storage: storage });


const registrationImage=async(req,res)=>{
  const documentImage=req.file
  console.log('documentImage',documentImage);
  
  
    const driver = await driverCollection.findOne({ email: email });

    if (!driver) {
        return res.status(404).json({ error: 'Driver  not found' });
    }

    if (driver.isBlocked) {
        return res.status(403).json({ error: 'Driver is blocked and cannot update registration' });
    }

    const updatedDriver = await driverCollection.findOneAndUpdate(
        { email: email },
        {
            $push: {
                registration: {
                   
                    documentImage,
                  
                }
            }
        },
        { new: true, upsert: true } 
    );

}

const registration = async (req, res) => {
  const { email, documentNumber, vehicleModel, vehicleNumber } = req.body;
  const documentImage = req.file ? req.file.filename : null;

  try {
    
    const driver = await driverCollection.findOne({ email: email });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

   
    if (driver.isBlocked) {
      return res.status(403).json({ error: 'Driver is blocked and cannot update registration' });
    }

    
    const updatedDriver = await driverCollection.findOneAndUpdate(
      { email: email },
      {
        $push: {
          registration: {
            documentNumber,
            documentImage,
            vehicleModel,
            vehicleNumber
          }
        }
      },
      { new: true, upsert: true } 
    );

    res.status(200).json({ success: true, message: 'Registration data added successfully!', driver: updatedDriver });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Error updating registration data', details: error.message });
  }
};




const forgotPassword=async(req,res)=>{
    const { email } = req.body;
    const generatedotp = generateOtp();
    console.log("generatedotp",generatedotp);
    try {
     
      const user = await driverCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      else{
        await sendOtpEmail(email, generatedotp);
        
        await driverCollection.updateOne({ email }, {  otp: generatedotp}, { upsert: true });
        return res.status(200).json({ message: 'OTP sent successfully' });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
  }


  const forgotOtp = async (req, res) => {
    const { email, otp } = req.body;
    console.log("e,amail",email);
    console.log('ootp',otp);
   
  
    try {
      const driver = await driverCollection.findOne({ email });
     
     
  
      if (!driver) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      if (driver.otp == otp) {
        driver.otp = null; // Clear OTP after verification
        await driver.save();
        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  


  const driverForgotPasswordResendOtp= async (req, res, next) => {
    const { email } = req.body;
  console.log('email',email);
    try {
      const driver = await driverCollection.findOne({ email });
  
      if (!driver) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const generatedotp = generateOtp();
      console.log('generatedotp',generatedotp);
  
    
      driver.otp = generatedotp;
      driver.otpExpires = new Date(Date.now() + 1 * 60 * 1000); // OTP expires in 10 minutes
      await driver.save();
  
      // Send OTP via email
      await sendOtpEmail(email, generatedotp);
  
      res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
      next(error);
    }
  };
  

 const passwordReset= async (req, res) => {
    const { email, newPasswords } = req.body;
  
    if (!email || !newPasswords) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }
  
    try {
      const user = await driverCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      user.password = await bcryptjs.hashSync(newPasswords, 10); // Hash the password before saving
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };



  


  const updateDriverLocation = async (req, res) => {
    const { email, latitude, longitude } = req.body;
    console.log('21122',latitude,longitude);
   
  
    if (!email || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
  
    try {
      const driver = await driverCollection.findOne({ email });
  
      if (!driver) {
        return res.status(404).json({ message: 'Driver  not found' });
      }
  
      driver.latitude = latitude;
      driver.longitude = longitude;
  
      await driver.save();
  
      return res.status(200).json({ message: 'Location updated successfully', driver });
    } catch (error) {
      console.error('Error updating driver location:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };


  const driverManagement = async (req, res) => {
    try {
      const approvedDrivers = await driverCollection.find({ "registration.status": "approved" });
      res.status(200).json(approvedDrivers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch approved drivers', error });
    }
  };

  const setOnlineOffline=async (req,res)=>{
    try {
      const { email, status } = req.body;
      console.log("statsus",status,"emailstatus",email);
      const driver = await driverCollection.findOneAndUpdate(
        { email },
        { status },
        { new: true }
      );

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      res.status(200).json({ success: true, data: driver });
    } catch (error) {
      res.status(400).json({ success: false, error });
    }

  }
  
  
  const availableVehicles = async (req, res) => {
    const { pickupLat, pickupLng, destinationLat, destinationLng,vehicleModel} = req.query;

    console.log('query', pickupLat, pickupLng, destinationLat, destinationLng,vehicleModel);

    if (!pickupLat || !pickupLng || !destinationLat || !destinationLng) {
        return res.status(400).json({ error: 'Pickup and destination positions are required.' });
    }

    const pickupCoords = { lat: parseFloat(pickupLat), lng: parseFloat(pickupLng) };
    console.log('pickupCoords', pickupCoords);
    const destinationCoords = { lat: parseFloat(destinationLat), lng: parseFloat(destinationLng) };

    try {
        console.log('Starting to find available drivers...');

        const availableDrivers = await driverCollection.find({
            status: 'available',
            
     
        });

        console.log('Found available drivers:', availableDrivers);
        res.json({ vehicles: availableDrivers });
    } catch (error) {
        console.error('Error occurred while fetching available vehicles:', error);  // Enhanced error logging
        res.status(500).json({ error: 'An error occurred while fetching available vehicles.' });
    }
};

const driverInfo= async (req, res) => {
  const { email } = req.params;
  console.log("emaildrivwer", email);
  const otp = generateOtp();
  console.log("otp for ride",otp);
  
  try {

    const driver = await driverCollection.findOneAndUpdate(
      { email },
      { 
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
      },
      { new: true }
    );

    if (driver) {
      res.json(driver);
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error) {
    console.error('Error fetching driver info:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const driverKycStatusInfo=async(req,res)=>{
  const { email } = req.params;
  console.log("emaildrivwer", email);
  
  try {
    const driver = await driverCollection.findOne({ email: email });
    console.log('driver', driver);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const registrationStatus = driver.registration.length > 0 ? driver.registration[0].status : 'pending';
    console.log("registrationStatus", registrationStatus);

    res.status(200).json({ registrationStatus: registrationStatus });
  } catch (error) {
    console.error('Error fetching driver info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const tripAmount = async (req, res) => {
 
  try {
    const { origins, destinations } = req.query;
    console.log("totalprice", origins, destinations);

    
  
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins,
          destinations,
          key: 'AIzaSyCAzgjpFOMCqPpDdaoI-ZPS6ihQygdp0rY',
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      res.status(500).send('Error fetching distance matrix');
    }
}
const tripDetails=async (req, res) => {
  const { email, tripDetails } = req.body;
console.log("tripId",tripDetails);
  try {
    const driver = await driverCollection.findOneAndUpdate(
      { email },
      { $push: { tripDetails } },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.status(200).json({ message: 'Trip details saved successfully', driver });
  } catch (error) {
    console.error('Error saving trip details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const driverProfile= async (req, res) => {
  const { email } = req.params;
  

  try {
    const user = await driverCollection.findOne({ email }, { drivername: 1, email: 1, mobile: 1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const driverProfileSidebar=async (req, res) => {
  const { email } = req.params;

  try {
    const user = await driverCollection.findOne({ email }, { drivername: 1, mobile: 1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const driverTripHistory=async (req, res) => {
  
  const { email } = req.params;

  try {
    const user = await driverCollection.findOne({ email });
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

export{
    registration,forgotPassword,forgotOtp,passwordReset,updateDriverLocation,driverManagement,driverForgotPasswordResendOtp,
    setOnlineOffline,availableVehicles,driverInfo,registrationImage,driverKycStatusInfo,tripAmount,tripDetails,driverProfile,
    driverProfileSidebar,driverTripHistory
}
  