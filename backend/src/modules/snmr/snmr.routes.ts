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
  updateWorkerStatus,
  deleteWorker,
  getSiteExpenses,
  createSiteExpense,
  getDocuments,
  uploadDocument,
  getSystemUsers,
  createSystemUser,
  importWorkerSalaries,
  notifyWorkerSalaries,
  importWorkers
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
router.post("/workers/import", importWorkers);
router.get("/workers/:id", getWorkerById);
router.put("/workers/:id/status", updateWorkerStatus);
router.delete("/workers/:id", deleteWorker);

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
router.post("/salaries/import", importWorkerSalaries);
router.post("/salaries/notify", notifyWorkerSalaries);

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
