const mongoose = require('mongoose')

const connectDB = async() => {
    try{
        // const conn = await mongoose.connect('mongodb+srv://ashwanth:ash@psa.7xyevjn.mongodb.net/talentskool?retryWrites=True&w=majority')
        const conn = await mongoose.connect('mongodb+srv://ashwanth:talent@talentskool.nklnoji.mongodb.net/database?retryWrites=True&w=majority')        
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }
    catch(error)
    {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB