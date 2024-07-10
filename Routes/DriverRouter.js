import express from 'express'
import { driverResendOtp, googleSignIn, signup } from '../Controller/AuthController.js';
import { signin } from '../Controller/AuthController.js';
import { verifyOtp } from '../Controller/AuthController.js';
import {  availableVehicles, driverForgotPasswordResendOtp, driverInfo, driverKycStatusInfo, driverProfile, driverProfileSidebar, driverTripHistory, forgotOtp, forgotPassword, passwordReset, registration, registrationImage, setOnlineOffline, tripAmount, tripDetails, updateDriverLocation } from '../Controller/DriverController.js';
import multer from 'multer';
import path from 'path'
import { fileURLToPath } from 'url';
import {driverIsBlocked}  from '../Middleware/driverIsBlocked.js'
import { uploadMiddleWare } from '../Middleware/fileUpload.js';


const router=express.Router();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../client/my-app/public');
    console.log('Upload Path:', uploadPath); // Ensure this path is correct
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});


const upload = multer({ storage: storage });

router.post('/signup',signup)
router.post('/signin',signin)
router.post('/facebook',googleSignIn)
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', driverResendOtp);
router.post('/registration',upload.single('documentImage'),registration)
router.post('/registrationImage',registrationImage)
router.post('/forgotpassword',forgotPassword)
router.post('/forgotPasswordOtp',forgotOtp)
router.post('/driverForgotPasswordResendOtp',driverForgotPasswordResendOtp)
router.post('/resetPassword',passwordReset)
router.post('/location',driverIsBlocked,updateDriverLocation)
router.post('/isOnlineOffline',setOnlineOffline)
router.get('/availableVehicles',availableVehicles)
router.get('/driverInfo/:email',driverInfo)
router.get('/driverkycinfo/:email',driverKycStatusInfo)
router.get('/api/distance',tripAmount)
router.post('/saveTripDetails',tripDetails)
router.get('/driverProfile/:email',driverProfile)
router.get('/driverProfileSidebar/:email',driverProfileSidebar)
router.get('/tripHistory/:email',driverTripHistory)



export default router;