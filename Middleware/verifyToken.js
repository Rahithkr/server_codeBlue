
import Jwt from 'jsonwebtoken';
import userCollection from '../Models/userModel.js';
import dotenv from 'dotenv'

dotenv.config()
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies['codeBlueUser-token'];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        Jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.user = decoded;

            // Fetch user from the database using the ID from the decoded token
            const user = await userCollection.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
            }

            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
