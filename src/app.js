import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import databaseConnection from "../config/database/connection.js";
import driverRoutes from "../Routes/DriverRouter.js";
import userRouter from "../Routes/UserRouter.js";
import adminRouter from "../Routes/AdminRouter.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import userCollection from "../Models/userModel.js";




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,

  cors: {
    // origin: "http://localhost:3000",
    origin: 'https://www.codeblue.ltd',
    credentials: true,
    optionSuccessStatus:200
  },
});


// app.use(cors());
app.use(cors({
  // origin: 'http://localhost:3000',
  origin: 'https://www.codeblue.ltd',
  credentials: true,
}));

app.use(express.static(path.join(__dirname, '../', 'public')));

io.on("connection", (socket) => {

  let driverSocketId = null;


  // Listen for ride requests from users
  socket.on("rideRequest", (data) => {
    
    console.log("Ride request received:", data);

    io.emit("rideRequestClient", { data });
   
  });

  socket.on('rideApproved', (rideResponse) => {
    
    console.log("rideResponse", rideResponse);
    
     io.emit('approveRide',{rideResponse})
     console.log('approveRide',rideResponse);
  })
   

    socket.on('driverReachedPickup', (handleDriverReachedPickup) =>{

      console.log('handleDriverReachedPickup',handleDriverReachedPickup);
      io.emit('DriverReachedPickup',{handleDriverReachedPickup})
    })

 

    socket.on('callDriver', (handleCallRequest) => {
      // Logic to find the driver's socket or initiate a call
      console.log("other",handleCallRequest);
      io.emit('incomingCall', { handleCallRequest });
    })


    socket.on('callUser', (handleCallRequests) => {
      // Logic to find the driver's socket or initiate a call
      console.log("other",handleCallRequests);
      io.emit('outCall', { handleCallRequests});
    })
    
    
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  
  });


});

dotenv.config();
const port = process.env.PORT;

databaseConnection();


app.use(bodyParser.json());
app.use("/server/driver", driverRoutes);
app.use("/server/user", userRouter);
app.use("/server/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("hello");
});





// app.listen(port,()=>{
// console.log("server started succefully");
// })
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
