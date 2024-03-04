const bcrypt = require('bcrypt')
const { json } = require('express');
const saltround = 10;


const hashpass = async (password) =>{
try {

    const hashedPassword = await bcrypt.hash(password,saltround)
    return hashedPassword;
} catch (error) {
    res.status(500),json({
        success:false,
        message: error.message
    })
    
}
} 


const passwordIsMatch = async (password,hashedPassword) =>{
    try {
        const isMatch =await bcrypt.compare(password,hashedPassword)
        return isMatch
        
    } catch (error) {

         res.status(500),json({
        success:false,
        message: error.message
    })
    
    }
}

module.exports ={hashpass,passwordIsMatch}

