import mongoose from 'mongoose';

const { Schema } = mongoose;

const companySchema = new Schema({
  name: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' }
});

const CompanyModel = mongoose.model('Company', companySchema);

export default CompanyModel;
