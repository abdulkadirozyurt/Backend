import mongoose from "mongoose";
import bcrypt  from "bcrypt";
import CompanyModel from './company.js';

const {Schema} = mongoose;

const adminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    phoneCode: { type: String, required: true },
    companyName: { type: String },
    role: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' }
});

adminSchema.pre('save', async function (next) {
    try {
        if (!this.companyId && this.companyName) 
        {
            const company = await CompanyModel.findOne({ name: this.companyName });
            if (company) {
              this.companyId = company._id;
            } else {
              const newCompany = new CompanyModel({ name: this.companyName });
              await newCompany.save();
              this.companyId = newCompany._id;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

const AdminModel = mongoose.model('Admin', adminSchema);
export default AdminModel;