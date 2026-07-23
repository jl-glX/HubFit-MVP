import express from "express";
import { authenticate } from "../middleware/authorization.js";
import { getDownloadManifest } from "../services/downloads.js";

export const downloadsRouter = express.Router();
downloadsRouter.use(authenticate);

downloadsRouter.get("/", (_req, res) => {
  res.json({ downloads: getDownloadManifest() });
});
