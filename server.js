const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ===== MIDDLEWARE ===== */

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===== DATABASE CONNECTION ===== */

mongoose.connect(process.env.MONGO_URI,{
useNewUrlParser:true,
useUnifiedTopology:true
})
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("MongoDB error:",err));

/* ===== SCHEMA ===== */

const NoteSchema = new mongoose.Schema({
data:Object,
date:String,
time:String,
passHash:{ type:String, unique:true }
});

const Note = mongoose.model("Note", NoteSchema);

/* ===== SAVE NOTE ===== */

app.post("/save", async (req,res)=>{

try{

const existing = await Note.findOne({ passHash:req.body.passHash });

if(existing){
return res.json({error:"Password already used"});
}

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

/* ===== LOAD ALL NOTES ===== */

app.post("/load", async (req,res)=>{

try{

const note = await Note.findOne({ passHash:req.body.passHash });

if(!note){
return res.json({error:"Not found"});
}

res.json(note);

}catch(err){

res.status(500).json({error:"Load failed"});

}

});

/* ===== START SERVER ===== */

const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{
console.log("Server running on port",PORT);
});