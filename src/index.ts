import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes";
import adminRoutes from "./routes/adminRoutes";
import authenticationRoutes from "./routes/authenticationRoutes";
import { loadDatabase } from "./controllers/MongoController";
import { startLoadingModel } from "./controllers/ModelController";
import { loadGame } from "./controllers/GameController";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/admin", adminRoutes);
app.use("/synoptix", gameRoutes);
app.use("/auth", authenticationRoutes);

const startApp = async () => {
  await loadDatabase();
  await loadGame();
  await startLoadingModel();
  app.listen(4000, () => {
    console.log("Server started on port 4000");
  });
};

startApp();
