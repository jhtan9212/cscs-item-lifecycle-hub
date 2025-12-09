import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

export const getUserTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { status, limit, offset } = req.query;

    const tasks = await TaskService.getUserTasks(req.user.userId, {
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return res.json(tasks);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProjectTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectId } = req.params;
    const tasks = await TaskService.getProjectTasks(projectId);
    return res.json(tasks);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const task = await TaskService.create(req.body);
    return res.status(201).json(task);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const completeTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const task = await TaskService.completeTask(id, req.user.userId);
    return res.json(task);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

