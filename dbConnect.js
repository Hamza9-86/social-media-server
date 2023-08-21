const mongoose = require('mongoose');

module.exports = async() =>{
    const mongoUri = "mongodb+srv://hamza123:L8B4RNiqTsUQxbmQ@cluster0.zfufels.mongodb.net/?retryWrites=true&w=majority";
    try{
    const connect = await mongoose.connect(mongoUri , { 
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
      console.log(`mongoDb connected : ${connect.connection.host}`);
    }
    catch(e){
        console.log(e);
        process.exit(1);
    }
};