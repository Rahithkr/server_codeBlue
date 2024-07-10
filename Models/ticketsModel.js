import mongoose from 'mongoose'

const TicketSchema = new mongoose.Schema({
  tripId: String,
  description: String,
  reply:String,
  status: { type: String, default: 'Pending' }, // 'Pending', 'Resolved', 'Closed'
  createdAt: { type: Date, default: Date.now },
});


const ticketCollection=mongoose.model('Ticket',TicketSchema)

export default ticketCollection;