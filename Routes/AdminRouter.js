import express from 'express'
import { adminSignin } from '../Controller/AuthController.js';
import  { blockDriver, blockUser, deleteTicket, driverKyc, getTicketStatus, kycStatus, raiseTicket, replayTicket, tickets, unblockDriver, unblockUser, userManagenent } from '../Controller/AdminController.js';
import { driverManagement } from '../Controller/DriverController.js';




const router=express.Router()


router.post('/adminsignin',adminSignin)
router.get('/userMangement',userManagenent)
router.post('/blockUser/:userId',blockUser)
router.post('/unblockUser/:userId',unblockUser)
router.get('/driverKyc',driverKyc)
router.put('/update-kyc-status',kycStatus)
router.get('/drivermanagement',driverManagement)
router.post('/blockDriver/:id', blockDriver);
router.post('/unblockDriver/:id', unblockDriver);
router.post('/raiseTicket',raiseTicket)
router.get('/tickets',tickets)
router.post('/replyTicket',replayTicket)
router.delete('/deleteTicket/:ticketId',deleteTicket)
router.get('/getTicketStatus/:tripId',getTicketStatus)

export default router;
