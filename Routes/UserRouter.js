import express from 'express'
import { confirmRide, forgotPassword, forgotPasswordOtp, forgotPasswordResendOtp, getTripId, getUserDetails, googleSignin, resendOtp, resetPassword, signin, signup, tripHistory, updateProfile, updateTripId, updateUserLocation, userProfileData, userProfileSidebar, verifyOtp } from '../Controller/UserAuthController.js';
import { verifyToken } from '../Middleware/verifyToken.js';


const router=express.Router()


router.post('/signup',signup)
router.post('/signin',signin)
router.post('/google',googleSignin)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp', resendOtp);
router.post('/forgot-password',forgotPassword)
router.post('/forgotpassword-otp',forgotPasswordOtp)
router.post('/forgotpasswordresend-otp',forgotPasswordResendOtp)
router.post('/reset-password',resetPassword)
router.post('/location',updateUserLocation)
router.post('/savedlocation',confirmRide)
router.get('/userDetails/:email',getUserDetails)
router.post('/updateTripId',updateTripId)
router.post('/getTripDetails/',getTripId)
router.get('/getTripHistory/:email',tripHistory)
router.put('/updateProfile/:email', updateProfile);
router.get('/userProfileSidebar/:email',userProfileSidebar)
router.get('/userProfile/:email',userProfileData)


// router.post('/payment',tripPayment)
export default router;