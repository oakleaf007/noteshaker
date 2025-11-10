import express from "express";
import Note from "../models/Note.js";

const router = express.Router();


// Get notes

router.get("/", async (req , res) =>{
    const notes = await Note.find().sort({updatedAT:-1});
    res.json(notes);
});


// create

router.post("/", async(req,res) => {
    const note = new Note(req.body);
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