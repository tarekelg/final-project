import Task from "../models/tasksSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllTasks = async (req, res, next) => {
  try {
    const task = await Task.find();
    // const task = await Task.find({content:req.cid});
    if (!task.length) {
      throw { statusCode: 404, message: "Task not found" };
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const CreateTask = async (req, res, next) => {
  // const {title,deadline,task_type,industry,description,created_by,...documents} = req.body;
  // const {content,...documents} = req.body;
  const { content } = req.body;
  console.log(content);
  // console.log(documents)
  try {
    // const newTask = new Task({title,deadline,task_type,industry,description,created_by,documents} );
    const newTask = new Task({ content });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
};

// export const updateTask = async (req, res, next) => {
//   const { id } = req.params;
//   const { content, documents } = req.body;
//   // const { title,deadline,task_type,industry,description,created_by,...documents} = req.body;
//   try {
//     const updatedTask = await Task.findByIdAndUpdate(
//       id,
//       { content, documents },
//       { new: true }
//     );
//     if (!updatedTask) {
//       throw { statusCode: 404, message: "Task not found" };
//     }
//     res.json(updatedTask);
//   } catch (error) {
//     next(error);
//   }
// };

//mit multer und cloudinary
export const updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { documentstitle, icon, title } = req.body;
  const documents = { documentstitle, icon };
  const content = { title };
  console.log(documents);
  console.log(content);
  try {
    if (req.file) {
      console.log(req.file);
      const url = req.file.path;
      console.log(url);
      documents.url = url;
      documents.public_id = req.file.filename;
    }

    const task = await Task.findById(id);

    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    let keys = Object.keys(content);

    keys.map((x) => {
      task.content[x] = content[x];
    });
    if (req.file) {
      task.documents.push(documents); // document zum alten hinzufügen
      console.log(documents);
    }

    //Delete Document

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.json({ message: "Task was deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskDocument = async (req, res, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  const { id, docID } = req.params;
  console.log(id);
  console.log(docID);
  let public_id = "";
  try {
    const task = await Task.findById(id);
    //find document and filter it out
    const filtered_documents = task.documents.filter(
      (document) => document._id != docID
    );

    //delete on cloudinary

    //find document and filter it out
    const doc = task.documents.filter((document) => document._id == docID);

    console.log(doc[0].public_id);

    const deletedRes = await cloudinary.uploader.destroy(
      doc[0].public_id,
      (error, result) => {
        if (result.result === "ok") {
          console.log(result); // { result: 'ok' }
        } else {
          console.log(error);
        }
      }
    );

    //delete document in DB through updating array in db
    console.log(filtered_documents);
    task.documents = filtered_documents;
    const updatedTask = await task.save();

    res.json(updateTask);
  } catch (error) {
    next(error);
  }
};

export const getTasksByOpen = async (req, res, next) => {
  try {
    const tasks = await Task.find({ "content.status": "OPEN" });
    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found" });
    }
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskByPro = async (req, res, next) => {
  try {
    const tasks = await Task.find({ "content.assigned_to": req.cid});
    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found" });
    } 
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}
export const getTaskByCid = async (req, res, next) => {
  try {
    const tasks = await Task.find({ "content.created_by": req.cid});
    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found" });
    } 
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}