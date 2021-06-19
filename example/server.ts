import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import { Server } from "../src";

const wopApp = new Server(22315);
const expressApp = express();

wopApp.get("users", async () => {
  const response = await fetch("https://api.github.com/users/0xc14m1z");
  return await response.json();
});

expressApp.use(cors({ allowedHeaders: "*", methods: "*", origin: "*" }));

expressApp.get("/users", async (_, res) => {
  const response = await fetch("https://api.github.com/users/0xc14m1z");
  res.status(200).json(await response.json());
});

expressApp.listen(3000, () => {
  console.log("expressApp: listening on port 3000");
});
