import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({ message: 'No token' });
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } 
    catch{
        res.status(401).json({ message: 'Invalid token' });
    }
}; 