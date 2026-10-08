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
