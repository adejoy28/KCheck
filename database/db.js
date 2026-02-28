// This will use Moongoose

const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MongoDB_URI);
        console.log('Connected to DB', connect.connection.host, connect.connection.name);
    } catch (err) {
        console.log('Error: ' + err);
        process.exit(1);
    }
}

module.exports = connectDb; 