import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import synoptixRoutes from "./routes/synoptixRoutes";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/synoptix", synoptixRoutes);

app.listen(4000, () => {
  console.log("Server started on port 4000");
});
