import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = () => {
  mongoose.connect(process.env.DB_URI, {
    dbName: 'atsdb',
  })
    .then(() => {
      
    })
    .catch((err) => {
      
    });
};

export default dbConfig;
