const app =require("./app")
const connectDB = require("./connection/db");

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`server runing in ${process.env.PORT}`);
});