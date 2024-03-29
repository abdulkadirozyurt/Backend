import mongoose from 'mongoose';

const { Schema } = mongoose;

const talentPoolSchema = new mongoose.Schema({
  poolName: { type: String, required: true },
  candidates: [{ type: Schema.Types.ObjectId }],
  createdDate: { type: Date, default: Date.now},
});

const TalentPoolModel = mongoose.model('TalentPool', talentPoolSchema);

export default TalentPoolModel;
