import { Request, Response } from "express";
import * as snmrService from "./snmr.service";

export const getSites = async (req: Request, res: Response) => {
  try {
    const sites = await snmrService.getSites();
    res.json(sites);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSite = async (req: Request, res: Response) => {
  try {
    const site = await snmrService.createSite(req.body);
    res.status(201).json(site);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await snmrService.getWorkers(req.query.siteId as string | undefined);
    res.json(workers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorker = async (req: Request, res: Response) => {
  try {
    const worker = await snmrService.createWorker(req.body);
    res.status(201).json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkerAttendance = async (req: Request, res: Response) => {
  try {
    const records = await snmrService.getWorkerAttendance(
      req.query.siteId as string,
      req.query.date as string
    );
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const markWorkerAttendance = async (req: Request, res: Response) => {
  try {
    const { workerId, siteId, date, status, otHours, remarks } = req.body;
    const record = await snmrService.markWorkerAttendance(
      workerId,
      siteId,
      new Date(date),
      status,
      otHours,
      remarks
    );
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkerAdvances = async (req: Request, res: Response) => {
  try {
    const advances = await snmrService.getWorkerAdvances(req.query.siteId as string | undefined);
    res.json(advances);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkerAdvance = async (req: Request, res: Response) => {
  try {
    const advance = await snmrService.createWorkerAdvance(req.body);
    res.status(201).json(advance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkerSalaries = async (req: Request, res: Response) => {
  try {
    const salaries = await snmrService.getWorkerSalaries(
      req.query.month ? parseInt(req.query.month as string) : undefined,
      req.query.year ? parseInt(req.query.year as string) : undefined
    );
    res.json(salaries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const generateWorkerSalaries = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    const salaries = await snmrService.generateWorkerSalaries(month, year);
    res.json(salaries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const payWorkerSalary = async (req: Request, res: Response) => {
  try {
    const salary = await snmrService.payWorkerSalary(req.params.id);
    res.json(salary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await snmrService.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const worker = await snmrService.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSiteExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await snmrService.getSiteExpenses(req.query.siteId as string);
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSiteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await snmrService.createSiteExpense({ ...req.body, recordedBy: (req as any).user?.email || 'Admin' });
    res.json(expense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await snmrService.getDocuments(req.query.entityType as string, req.query.entityId as string);
    res.json(documents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const doc = await snmrService.uploadDocument({ ...req.body, uploadedBy: (req as any).user?.email || 'Admin' });
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSystemUsers = async (req: Request, res: Response) => {
  try {
    const users = await snmrService.getSystemUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    await snmrService.deleteDocument(req.params.id);
    res.json({ message: "Document deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSystemUser = async (req: Request, res: Response) => {
  try {
    const user = await snmrService.createSystemUser(req.body);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWorkerStatus = async (req: Request, res: Response) => {
  try {
    const worker = await snmrService.updateWorkerStatus(req.params.id, req.body.status, req.body.exitReason);
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteWorker = async (req: Request, res: Response) => {
  try {
    if (req.query.password !== 'Password@123') {
      return res.status(403).json({ error: 'Incorrect admin password.' });
    }
    await snmrService.deleteWorker(req.params.id);
    res.json({ message: 'Worker deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const importWorkerSalaries = async (req: Request, res: Response) => {
  try {
    const { month, year, updates } = req.body;
    const results = await snmrService.importWorkerSalaries(month, year, updates);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const notifyWorkerSalaries = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    const result = await snmrService.notifyWorkerSalaries(month, year);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const importWorkers = async (req: Request, res: Response) => {
  try {
    const results = await snmrService.importWorkers(req.body.workers);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWorker = async (req: Request, res: Response) => {
  try {
    const worker = await snmrService.updateWorker(req.params.id, req.body);
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
