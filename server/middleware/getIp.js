export const getIpAddress = (req, res, next) => {
    // Standard 'x-forwarded-for' header for proxies, or fallback to remoteAddress
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.clientIp = ip;
    next();
}; 