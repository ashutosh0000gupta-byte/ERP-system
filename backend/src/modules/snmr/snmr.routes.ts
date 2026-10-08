import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getSites,
  createSite,
  getWorkers,
  createWorker,
  getWorkerAttendance,
  markWorkerAttendance
} from "./snmr.controller";

const router = Router();

router.use(requireAuth);

// Sites
router.get("/sites", getSites);
router.post("/sites", createSite);

// Workers
router.get("/workers", getWorkers);
router.post("/workers", createWorker);

// Worker Attendance
router.get("/attendance", getWorkerAttendance);
router.post("/attendance", markWorkerAttendance);

export default router;
