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
