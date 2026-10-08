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
  getDashboardStats,
  getWorkerById,
  getSiteExpenses,
  createSiteExpense,
  getDocuments,
  uploadDocument,
  getSystemUsers,
  createSystemUser
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
router.get("/workers/:id", getWorkerById);

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

// Expenses
router.get("/expenses", getSiteExpenses);
router.post("/expenses", createSiteExpense);

// Documents
router.get("/documents", getDocuments);
router.post("/documents", uploadDocument);

// Users
router.get("/users", getSystemUsers);
router.post("/users", createSystemUser);

export default router;
