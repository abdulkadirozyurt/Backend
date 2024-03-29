import KanbanModel from '../model/kanban.js'
import mongoose from "mongoose";

const createKanban = async (jobId) => {
    try{
        const kanbanBoard = await KanbanModel.find({jobId})

        if(kanbanBoard.length == 0){

            const columns = [
                {
                    _id: new mongoose.Types.ObjectId() ,
                    name: "applied"
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: "accepted"
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: "rejected"
                }
            ]
            const newKanbanBoard = new KanbanModel({
                jobId:jobId,
                columns:columns
            });
            await newKanbanBoard.save();

            return newKanbanBoard;
        }
        
        return null
    }catch(error){
        return error
    }
}


const getKanbanByJobId = async (req, res) => {
    try{
        const {jobId} = req.body
    
        let kanbanBoard = await KanbanModel.find({jobId:jobId})

        if(kanbanBoard.length == 0){
            kanbanBoard = await createKanban(jobId)
        }
        
        return res.json({success:true, message: "Operation was succesfull", kanbanBoard})
    }catch(error){
        return res.json({success:false, message:error})
    }   
};


const addColumn = async (req, res) => {
    try{
        const {columnName, _id} =req.body;

        const kanbanBoard = await KanbanModel.findById(_id)

        if(!kanbanBoard){
            return res.json({success:false, message: "Kanban board not found for the position"})
        }

        let columns = []

        for (let i = 0; i < kanbanBoard.columns.length; i++) {
            columns.push(kanbanBoard.columns[i]);

            if(columnName === kanbanBoard.columns[i].name){
                return res.json({success:false, message: "This column already exist"})
            }
        }

        let newColumn ={
            _id: new mongoose.Types.ObjectId() ,
            name: columnName
        }
        
        columns.push(newColumn)

        await KanbanModel.findByIdAndUpdate(kanbanBoard._id,{
            columns: columns
        })

        return res.json({success:true, message: "Operation was succesfull"})

    }catch(error){
        return res.json({success:false, message:error})
    }
};

const deleteColumn = async (req, res) => {
    try{
        const {columnId, _id} =req.body;

        const kanbanBoard = await KanbanModel.findById(_id)

        if(!kanbanBoard){
            return res.json({success:false, message: "Kanban board not found for the position"})
        }

        let columns = []
        let columnExist = false;

        for (let i = 0; i < kanbanBoard.columns.length; i++) {

            if(columnId === kanbanBoard.columns[i]._id){
                columnExist = true;
            }else{
                columns.push(kanbanBoard.columns[i]);
            } 
        }

        if(!columnExist){
            return res.json({success:false, message: "This column was not found"})
        }

        await KanbanModel.findByIdAndUpdate(kanbanBoard._id,{
            columns: columns
        })

        return res.json({success:true, message: "Operation was succesfull"})

    }catch(error){
        return res.json({success:false, message:error})
    }
};  

const updateColumn = async (req, res) => {
    try{
        const {columnId, _id, columnNewName} =req.body;

        const kanbanBoard = await KanbanModel.findById(_id)

        if(!kanbanBoard){
            return res.json({success:false, message: "Kanban board not found for the position"})
        }

        let columnExist = false;
        for (let i = 0; i < kanbanBoard.columns.length; i++) {

            if(columnId === kanbanBoard.columns[i]._id){
                kanbanBoard.columns[i].name=columnNewName;
                columnExist = true;
            }
        }

        if(!columnExist){
            return res.json({success:false, message: "This column was not found"})
        }

        await KanbanModel.findByIdAndUpdate(kanbanBoard._id,{
            columns: kanbanBoard.columns
        })

        return res.json({success:true, message: "Operation was succesfull"})

    }catch(error){
        return res.json({success:false, message:error})
    }
};  

export { addColumn, getKanbanByJobId, deleteColumn, updateColumn }