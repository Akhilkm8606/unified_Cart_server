 const mongoose = require("mongoose")
 const path =require('path');
 const dotenv = require('dotenv')
dotenv.config({path: path.resolve(__dirname, 'confiq', 'confiq.env')});

 
//connect db
 const connectDB =async ()=>{

    mongoose.connect(process.env.DB_URL,)
    .then((res) => console.log(`database connected with${res.connection.host}`))
    .catch((error) => console.log(error.message))

 } 
module.exports= connectDB;