import driverCollection from '../Models/driverModel.js';
import ticketCollection from '../Models/ticketsModel.js';
import usercollection from '../Models/userModel.js'




const userManagenent=async(req,res)=>{

   try {
    const users=await usercollection.find()
   
    res.json(users)
   } catch (error) {
   res.status(500).send('server error')
   }
}

const blockUser = async (req, res) => {
    console.log('Received params:', req.params); 
    try {
        const { userId } = req.params;
       
  
        await usercollection.updateOne({ _id: userId }, { $set: { isBlocked: true } });
        
        res.status(200).send('User blocked');
    } catch (error) {
        res.status(500).send('server error');
    }
};

const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await usercollection.updateOne({ _id: userId }, { $set: { isBlocked: false } });
        res.status(200).send('User unblocked');
    } catch (error) {
        res.status(500).send('server error');
    }
};

const driverKyc=async(req,res)=>{

    try {
     const drivers=await driverCollection.find()
    
     res.json(drivers)
    } catch (error) {
    res.status(500).send('server error')
    }
 }
 
 const kycStatus=async (req, res) => {
    const { email, documentNumber, status } = req.body;

    try {
       
        const driver = await driverCollection.findOne({ email });

        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

      
        const registrationDoc = driver.registration.find(reg => reg.documentNumber === documentNumber);

        if (!registrationDoc) {
            return res.status(404).json({ success: false, error: 'Registration document not found' });
        }

        
        registrationDoc.status = status;

     
        await driver.save();

        res.status(200).json({ success: true, message: 'KYC status updated successfully!', driver });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update KYC status', details: error.message });
    }
};



const blockDriver = async (req, res) => {
    try {
      const driver = await driverCollection.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      res.status(200).json({ message: 'Driver blocked successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to block driver', error });
    }
  };
  
   const unblockDriver = async (req, res) => {
    try {
      const driver = await driverCollection.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      res.status(200).json({ message: 'Driver unblocked successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to unblock driver', error });
    }
  };

  const raiseTicket = async (req, res) => {
    const { tripId, description } = req.body;
    console.log("tripID", tripId, "description", description);
    try {
      
      const driver = await driverCollection.findOne({ "tripDetails.tripId": tripId });
  console.log('driver',driver);
      if (!driver) {
        return res.status(404).send({ message: 'Trip not found' });
      }
  
      // Extract the specific trip details
      // const tripDetails = driver.tripDetails.tripId(tripId);
      const tripDetails=driver.tripDetails.find(detail => detail.tripId === tripId);
      console.log('trip',tripDetails);
      if (!tripDetails) {
        return res.status(404).send({ message: 'Trip details not found' });
      }
  
      // Create a new ticket
      const newTicket = new ticketCollection({
        tripId,
        description,
        status: 'Pending',
        createdAt: new Date()
      });
  
      await newTicket.save();
  
      // Respond with the trip details and ticket information
      res.status(200).send({
        message: 'Ticket raised successfully',
        tripDetails,
        ticket: newTicket
      });
    } catch (error) {
      res.status(500).send({ message: 'Error raising ticket', error });
    }
  };

  const tickets= async (req, res) => {
    try {
      const tickets = await ticketCollection.find();
      const detailedTickets = await Promise.all(tickets.map(async (ticket) => {
        const driver = await driverCollection.findOne({ "tripDetails.tripId": ticket.tripId });
        // const tripDetails = driver ? driver.tripDetails.tripId(ticket.tripId) : null;
        const tripDetails = driver ? driver.tripDetails.find(detail => detail.tripId === ticket.tripId) : null;
        return {
          ...ticket._doc,
          tripDetails
        };
      }));
      res.status(200).send(detailedTickets);
    } catch (error) {
      res.status(500).send({ message: 'Error fetching tickets', error });
    }
  };

const replayTicket= async (req, res) => {
  try {
      const { ticketId, reply } = req.body;
      console.log('ticktid',ticketId,'replay',reply);
      const updatedTicket = await ticketCollection.findOneAndUpdate(
        { tripId: ticketId },
        { reply, status: 'Resolved' }, 
        { new: true } 
      );

      if (!updatedTicket) {
          return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json({ ticket: updatedTicket });
  } catch (error) {
      console.error('Error replying to ticket:', error);
      res.status(500).json({ message: 'Server error' });
  }
}


const deleteTicket= async (req, res) => {
  const ticketId = req.params.ticketId;

  try {
   
    await ticketCollection.findByIdAndDelete(ticketId);

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
}
const getTicketStatus= async (req, res) => {
  const { tripId } = req.params;
 console.log("tripiddd",tripId);
 
  try {
    const ticket = await ticketCollection.findOne({ tripId });

    if (ticket) {
      res.json({ status: ticket.status }); 
    } else {
      res.status(404).json({ message: 'Ticket not found' }); 
    }
  } catch (error) {
    console.error('Error fetching ticket status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
    userManagenent,driverKyc,kycStatus,blockUser,unblockUser,blockDriver,unblockDriver,raiseTicket,tickets,replayTicket,
    deleteTicket,getTicketStatus
}