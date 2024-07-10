import mongoose from 'mongoose'




const tripDetailsSchema = new mongoose.Schema({
  drivername:{
    type:String,
    required:true,

},
  pickupPosition: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String,},

  },
  destinationPosition: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String,},

  },
  tripAmount: {
    type: Number,
    required: true
  },
  // tripId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Trip',
  // },
  tripId:{
    type:String
  },

}, { timestamps: true });



const userSchema=new mongoose.Schema({
    username:{
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
        // required:true
    },
    password:{
        type:String,
        // required:true
    },
    otp:{
        type:Number,
        
    },
    otpExpires: {
        type: Date
      },
      latitude: {
        type: Number,
        required: true,
        default: 0,
      },
      longitude: {
        type: Number,
        required: true,
        default: 0,
      },
      pickupPosition: {
        lat: Number,
        lng: Number,
        address: String,
      },
      destinationPosition: {
        lat: Number,
        lng: Number,
        address: String,
      },
    isBlocked: { 
        type: Boolean,
         default: false 
        },
       tripDetails:[tripDetailsSchema]
    
},{timestamps:true})



const userCollection=mongoose.model('user',userSchema)

export default userCollection;