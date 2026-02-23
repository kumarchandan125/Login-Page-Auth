import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";

const app = express();

const port = process.env.PORT || 4000;

connectDB();
const allowedOrigins=[
  process.env.FRONTEND_URL
]

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use(cors({ credentials: true, origin: allowedOrigins }));

//Api EndPoint
app.get("/", (req, res) => {
  res.send("API Working Fine");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
});
