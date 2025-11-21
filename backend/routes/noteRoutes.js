import express from "express";
import Note from "../models/Note.js";

const router = express.Router();


// Get notes

router.get("/", async (req , res) =>{
    const email = req.query.email;
    const notes = await Note.find({email}).sort({updatedAT:-1});
    res.json(notes);
});


// create

router.post("/", async(req,res) => {
    const {title, content, email} = req.body;
    const note = new Note({
       title, content, email 
    });
    await note.save();
    res.json(note);
});

// edit

router.put("/:id",  async(req,res) => {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {new:true});
    res.json(note);
});

// delete

router.delete("/:id", async(req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    res.json({success: true});
});

export default router;