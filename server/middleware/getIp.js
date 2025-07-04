export const getIpAddress = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.clientIp = ip;
    next();
}; 