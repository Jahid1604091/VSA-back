const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    //get token from header
    const token = req.header('x-auth-token');

    //check if no token
    if(!token){
        return res.status(401).json([{msg:'Please Sign in first!'}]);
    }

    //verify token
    try {
        //decoded is an object having id that passed using payload user:{id:{...}}
        //just like payload format
        const decoded = jwt.verify(token,process.env.jwtToken);
      
        //attach the user(user id) with req to access it next
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json([{msg:'token not validated !'}])
    }
}