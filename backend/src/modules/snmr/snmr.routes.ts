import path from "path";
import multer from "multer";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import {
  getSites,
  createSite,
  deleteSite,
  updateSite,
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
  updateWorker,
  deleteWorker,
  getSiteExpenses,
  createSiteExpense,
  getDocuments,
  uploadDocument,
  deleteDocument,
  getSystemUsers,
  createSystemUser,
  importWorkerSalaries,
  importMonthlyExcelSalaries,
  updateWorkerSalary,
  notifyWorkerSalaries,
  importWorkers,
  recordWorkerPayment,
  getWorkerLedger,
  toggleSalaryLock,
  lockMonthSalaries,
  clearAllDemoData,
  getExcelSheetArchives,
  getExcelCategories,
  uploadExcelSheetArchive,
  deleteExcelSheetArchive
} from "./snmr.controller";

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const router = Router();

router.use(authenticate);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Sites
router.get("/sites", getSites);
router.post("/sites", createSite);
router.delete("/sites/:id", deleteSite);
router.put("/sites/:id", updateSite);

// Workers
router.get("/workers", getWorkers);
router.post("/workers", createWorker);
router.post("/workers/import", importWorkers);
router.get("/workers/:id", getWorkerById);
router.get("/workers/:id/ledger", getWorkerLedger);
router.put("/workers/:id/status", updateWorkerStatus);
router.put("/workers/:id", updateWorker);
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
router.post("/salaries/payment", recordWorkerPayment);
router.post("/salaries/lock-month", lockMonthSalaries);
router.put("/salaries/:id/lock", toggleSalaryLock);
router.put("/salaries/:id", updateWorkerSalary);
router.post("/salaries/:id/pay", payWorkerSalary);
router.post("/salaries/import", importWorkerSalaries);
router.post("/salaries/import-monthly", importMonthlyExcelSalaries);
router.post("/salaries/notify", notifyWorkerSalaries);

// Expenses
router.get("/expenses", getSiteExpenses);
router.post("/expenses", createSiteExpense);

// Documents
router.get("/documents", getDocuments);
router.post("/documents", uploadDocument);
router.delete("/documents/:id", deleteDocument);

// Users
router.get("/users", getSystemUsers);
router.post("/users", createSystemUser);

// Excel Sheets Hub / Repository
router.get("/excel-sheets", getExcelSheetArchives);
router.get("/excel-sheets/categories", getExcelCategories);
router.post("/excel-sheets/upload", excelUpload.single("file"), uploadExcelSheetArchive);
router.delete("/excel-sheets/:id", deleteExcelSheetArchive);

// Database Cleanup / Reset
router.post("/clear-demo-data", clearAllDemoData);

export default router;
