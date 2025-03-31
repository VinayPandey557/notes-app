require("dotenv").config();
const express =  require("express");
const cors = require("cors");
const zod = require("zod");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./auth/middleware");
const User = require("./models/user-model");
const Note = require("./models/note-model");
const JWT_SECRET = process.env.JWT_SECRET;





mongoose.connect("your-db-string", {
    authSource:"admin"
}) 
.then(() => console.log("Connected to mongodb"))
.catch(err => console.error("Mongodb connection error", err));

const app = express();
app.use(cors());
app.use(express.json());


//create Account

const signUpBody = zod.object({
    name: zod.string().min(3, "Full name must be at least 3 characters"),
    email: zod.string().email(),
    password: zod.string().min(6, "Password must be at least 6 characters")
})
app.post("/create-account", async (req, res) => {
   try {
    const { email } = req.body;
    const isUser = await User.findOne({ email: email });
    if(isUser){
        return res.json({
            error: true,
            message: "User already exists"
        })
    } 
    const { success, error } = signUpBody.safeParse(req.body);
    if(!success){
        res.status(411);
        return res.json({
            message: "Invalid Input",
            error: error.errors,
        });
    }

    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    const token = jwt.sign({email: user.email}, JWT_SECRET, { expiresIn: "3600m" });
    res.json({
        error: false,
        user,
        message: "You are signed up",
        token
    })
   }  catch (err) {
    if (err instanceof zod.ZodError) {
        return res.status(400).json({ message: "Invalid Input", errors: err.errors });
    }
    res.status(500).json({ message: "Error creating account", error: err.message });
   }
})


//Login Route

const signInBody = zod.object({
    email: zod.string().email(),
    password: zod.string()
})

app.post("/login", async (req, res) => {
   const { success, error }  = signInBody.safeParse(req.body);
   
  if(!success){
    return res.status(411).json({
       messsage:"Invalid input",
       error: error.errors
    })
  }
  const { email, password } = req.body;
  if(!email || !password) {
    return res.status(411).json({
        message: "Invalid credentials"
    })
  }
  const response = await User.findOne({
    email: req.body.email,
    password: req.body.password
  })
  if(response){
    const token = jwt.sign({ email: response.email}, JWT_SECRET, { expiresIn: "1h"});
    res.json({
        error: false,
        message: "login successfull",
        token,
        email,
        userId: response._id
    })
  } else {
    res.status(403).json({
        message: "Incorret creds"
    })
  }
})



app.get("/get-user",authMiddleware,  async(req, res) => {
  const userId = req.user._id;


  const isUser = await User.findOne({_id: userId });
 

  if(!isUser){
    return res.status(401)
  }
  return res.json({
    user: {
       name: isUser.name,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn 
       },
    message: ""
  })
 })


// Add Note

app.post("/add-note", authMiddleware,  async(req, res) => {
   const { title, content, tags } = req.body;
   const userId = req.user._id;
  

   if(!title){
    return res.status(400).json({ error: true, message: "Title is required" });
   }

   if(!content){
    return res.status(400).json({
        error: true,
        message: "Content is required"
    });
   }

   try {
     const note = await Note.create({
        title,
        content,
        tags: tags || [],
        userId
    
     }) 
     res.json({ 
        error: false,
        note,
        message: "Note added successfully",
     })
   } catch(error){
     return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        details: error.message
     })
   }
})


app.put("/edit-note/:noteId", authMiddleware, async (req, res) => {
      const { title , content, tags , isPinned } = req.body;
      const noteId = req.params.noteId;
     
      const userId = req.user._id;
     

      if(!title && !content && !tags) {
        return res.status(400).json({
          error: true,
          message: "No changes provided"
        });
      }

      try {
        const note = await Note.findOne({ _id: noteId, userId });
        if(!note){
          return res.status(404).json({ error: true, message: "Note not found" });
        }
        if(title) note.title = title;
        if(content) note.content = content;
        if(tags) note.tags = tags;
        if(isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
          error: false,
          note,
          message: "Note updated successfull",
        });
      } catch(error){
        return res.status(500).json({
          error: error,
          message: "Internal Server Error",
          
        })
      }
    })


    app.get("/get-all-notes", authMiddleware, async(req, res) => {
      const userId = req.user._id;
      try {
        const notes = await Note.find({ userId }).sort({ isPinned: -1 });
        return res.json({
          error: false,
          notes,
          message: "All notes retrived successfully",
        });
      }catch (error){
        return res.status(500).json({
          error: true,
          message: "Internal Server error"
        });
      }
    })


    app.delete("/delete-note/:noteId", authMiddleware, async(req, res) => {
  

      const noteId = req.params.noteId;
      const userId = req.user._id;

      try {
        const note = await Note.findOne({
          _id:noteId, userId
        });

        if(!note){
          return res.status(404).json({
            message: "Note not found"
          });
        }
        await Note.deleteOne({ _id: noteId, userId });
        return res.json({ 
          error: false,
          message: "Note deleted successfully",
        });

      } catch( error ){
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
        });
      }

    })


   // Update isPinned Value


   app.put("/update-note-pinned/:noteId", authMiddleware, async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.user._id;
    const { isPinned } = req.body;
  
    console.log("Received request to update note:", { noteId, userId, isPinned });
  
    if (isPinned === undefined) {
      return res.status(400).json({
        error: true,
        message: "No changes provided",
      });
    }
  
    try {
      const note = await Note.findOne({ _id: noteId, userId });
  
      if (!note) {
        console.log("Note not found for user:", { noteId, userId });
        return res.status(404).json({
          error: true,
          message: "Note not found",
        });
      }
  
      note.isPinned = isPinned;
      await note.save();
  
      return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });
    } catch (error) {
      console.error("Error updating note:", error);
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  });
  

    app.get("/search-notes", authMiddleware, async(req, res) => {
      const  userId     = req.user._id;
      const { query } = req.query;
    


      if(!query){
        return res.status(400).json({
          error: true,
          message: "Search query is required"
        });
      }

      try {
        const matchingNote = await Note.find({
          userId:userId,
          $or: [
            { title: { $regex: new RegExp(query, "i") } },
            { content: { $regex: new RegExp(query, "i") } },
          ],
        })
        return res.json({
          error: false,
          notes: matchingNote,
          message: "Notes matching the search retrieved successfully"
        })

      } catch(error){
        return res.status(500).json({
          error: true,
          message:"Internal Server Error"
        })
      }
    })


app.listen(3000);

