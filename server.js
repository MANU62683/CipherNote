require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

/* ===== MIDDLEWARE ===== */

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===== DATABASE CONNECTION ===== */

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("MongoDB error:",err));

/* ===== SCHEMA ===== */

const NoteSchema = new mongoose.Schema({

data: Object,
date: String,
time: String,
passHash:{ type:String, unique:true }

});

const Note = mongoose.model("Note", NoteSchema);

/* ===== SAVE NOTE ===== */

app.post("/save", async (req,res)=>{

try{

/* check duplicate password */

const existing = await Note.findOne({ passHash:req.body.passHash });

if(existing){
return res.json({error:"Password already used"});
}

/* create note */

const note = new Note({

data:req.body.data,
date:req.body.date,
time:req.body.time,
passHash:req.body.passHash

});

await note.save();

res.json({message:"Note saved"});

}catch(err){

console.error(err);

res.status(500).json({error:"Save failed"});

}

});


/* ===== LOAD NOTES ===== */

app.get("/load", async (req,res)=>{

try{

const notes = await Note.find().sort({_id:-1});

res.json(notes);

}catch(err){

console.error(err);

res.status(500).json({error:"Load failed"});

}

});


/* ===== START SERVER ===== */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Server running");
});