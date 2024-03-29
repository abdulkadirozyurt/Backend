import AdminModel from "../model/admin.js";
import UserModel from "../model/user.js";
import jwt from 'jsonwebtoken';

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
        if (!token){
            return res.status(401).json({
                success: false,
                error: 'No token available',
            });
        }
    
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        var user = await UserModel.findById(decodedToken.userId);

        !user ? user = await AdminModel.findById(decodedToken.userId) : user = user;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
            });
        }

        req.user = user;
    
        next();    
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Not authorized',
        });    
    }
}

export { authenticateToken };
