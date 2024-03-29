const { Schema } = mongoose;
import mongoose from "mongoose";

const kanbanSchema = new mongoose.Schema({
    columns: [{
        _id: { type: String },
        name: { type: String }
    }],
    jobId:{type:Schema.Types.ObjectId}
});

kanbanSchema.pre("save", async function (next) {
  try {
    next();
  } catch (error) {
    next(error);
  }
});

const KanbanModel = mongoose.model("kanban",kanbanSchema);

export default KanbanModel;
