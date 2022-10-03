const mongoose = require('mongoose');
// const db = `mongodb://localhost:27017/vsaDB`;
const db = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eohva.mongodb.net/vsaDB`;
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Mongo db connected on ' + conn.connection.host);
    } catch (error) {
        console.log(`error in connecting db : ${error.message}`);

        //exit process
        process.exit(1);
    }
}

module.exports = connectDB;