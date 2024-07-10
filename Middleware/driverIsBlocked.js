import driverCollection from "../Models/driverModel.js";



export const driverIsBlocked = async (req, res, next) => {
    const { email } = req.body;
  
    try {
      const driver = await driverCollection.findOne({ email });
  
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
  
      if (driver.isBlocked) {
        return res.status(403).json({ message: 'Driver is blocked' });
      }
  
      next();
    } catch (error) {
      console.error('Error checking blocked status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


 