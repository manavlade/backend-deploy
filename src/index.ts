import express from "express";
import { prisma } from "./config/prisma";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});