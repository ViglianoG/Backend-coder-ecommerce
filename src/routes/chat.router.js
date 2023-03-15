import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const user = req.session.user;
  res.render("chat", { user });
});

export default router;
