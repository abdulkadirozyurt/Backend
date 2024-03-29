import mongoose from "mongoose";
import bcrypt  from "bcrypt";
import CompanyModel from './company.js';

const {Schema} = mongoose;

// Kullanıcı şeması oluştur
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    phoneCode: { type: String, required: false },
    companyName: { type: String },
    role: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' }
});

userSchema.pre('save', async function (next) {
    try {
        next();
    } catch (error) {
        next(error);
    }
});

// Kullanıcı modelini oluştur
const UserModel = mongoose.model('User', userSchema);
export default UserModel;