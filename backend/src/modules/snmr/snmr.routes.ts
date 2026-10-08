import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import {
  getSites,
  createSite,
  getWorkers,
  createWorker,
  getWorkerAttendance,
  markWorkerAttendance,
  getWorkerAdvances,
  createWorkerAdvance,
  getWorkerSalaries,
  generateWorkerSalaries,
  payWorkerSalary,
  getDashboardStats
} from "./snmr.controller";

const router = Router();

router.use(authenticate);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Sites
router.get("/sites", getSites);
router.post("/sites", createSite);

// Workers
router.get("/workers", getWorkers);
router.post("/workers", createWorker);

// Worker Attendance
router.get("/attendance", getWorkerAttendance);
router.post("/attendance", markWorkerAttendance);

// Advances
router.get("/advances", getWorkerAdvances);
router.post("/advances", createWorkerAdvance);

// Salary
router.get("/salaries", getWorkerSalaries);
router.post("/salaries/generate", generateWorkerSalaries);
router.post("/salaries/:id/pay", payWorkerSalary);

export default router;
