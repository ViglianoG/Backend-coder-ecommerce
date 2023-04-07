import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const { level } = req.query;

  if (!level) return res.json("Waiting for queries...");

  if (!["debug", "http", "info", "warning", "error", "fatal"].includes(level)) {
    return res.json({ status: "error", error: "invalid query..." });
  }

  req.logger[level]("testing logger");

  res.json({ result: "testing" });
});

export default router;
