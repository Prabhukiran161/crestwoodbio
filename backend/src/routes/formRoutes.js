import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { insertIntroduction , updateIntroduction, getIntroduction} from "../controllers/introController.js";
const router = express.Router();

router.post("/", authenticateUser, insertIntroduction);
router.put("/", authenticateUser, updateIntroduction);
router.get("/", authenticateUser, getIntroduction);

export default router;