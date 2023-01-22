const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

// Middlewares
app.use(express.json());

// cors 
app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );

  // Routes Middleware
// app.use("/api/users", userRoute)

  // Routes
app.get("/", (req, res) => {
    res.send("Home Page");
  });

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));