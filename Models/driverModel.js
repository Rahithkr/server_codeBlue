import mongoose from 'mongoose'



const tripDetailsSchema = new mongoose.Schema({
    userEmail: {
      type: String,
      required: true
    },
    pickupPosition: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String,},
    },
    destinationPosition: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, },
    },
    tripAmount: {
      type: Number,
      required: true
    },
    tripId :{
      type:String},

  }, { timestamps: true });


const driverSchema=new mongoose.Schema({
    drivername:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        
    },
    otpExpires: {
        type: Date
      },latitude: {
        type: Number,
        required: true,
        default: 0,
      },
      longitude: {
        type: Number,
        required: true,
        default: 0,
      },isBlocked: { 
        type: Boolean,
         default: false 
        },
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number] // [longitude, latitude]
          },
          status: { 
            type: String, 
            enum: ['available', 'unavailable'], 
            default: 'unavailable' 
        },
       registration:[{
            documentNumber: {
            type: String,
            required: true,
        },
        documentImage: {
            type: String,
            // required: true, 
        },
        vehicleModel:{
            type:String,
            required:true
        },
        vehicleNumber:{
            type:String,
            required:true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }],
    tripDetails: [tripDetailsSchema]
    
    
},{timestamps:true})



const driverCollection=mongoose.model('driver',driverSchema)

export default driverCollection;