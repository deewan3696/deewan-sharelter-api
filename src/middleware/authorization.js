require('dotenv').config()
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || "keep-secret-secure123#"
 const {findQuery} = require("../repository/index")

const authorization = async(req, res, next) => {
 
    const { authorization } = req.headers
    if (!authorization) {
        res.status(401).send({
            status: false,
            message: 'Unauthorized Access'
                    
        })
    } else {

        const tokenSplit = authorization.split(" ")
        jwt.verify(tokenSplit[1], jwtSecret,async(err, decoded) => {

            if (err) {
                res.status(401).send({
                    status: false,
                    message: 'Unauthorized Acesss' 
                        
                })
            }
            const user = await findQuery("Users", { email: decoded.email })
            
            req.params.user_id = user[0].user_id   
            next()   
         
        })
    }


}


module.exports =  authorization