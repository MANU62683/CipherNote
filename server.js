const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* middleware */

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* database connection */

mongoose.connect("mongodb://127.0.0.1:27017/ciphernote")
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("MongoDB error:",err));

/* schema */

const NoteSchema = new mongoose.Schema({
data: Object,
date: String,
time: String
});

const Note = mongoose.model("Note", NoteSchema);

/* save encrypted note */

app.post("/save", async (req,res)=>{

try{

const note = new Note({
data: req.body.data,
date: req.body.date,
time: req.body.time
});

await note.save();

res.json({message:"Note saved"});

}catch(err){

console.error(err);
res.status(500).json({error:"Save failed"});

}

});

/* load latest encrypted note */

app.get("/load", async (req,res)=>{
const notes = await Note.find().sort({_id:-1});
res.json(notes);
});

/* start server */

app.listen(3000,()=>{
console.log("Server running at http://localhost:3000");
});