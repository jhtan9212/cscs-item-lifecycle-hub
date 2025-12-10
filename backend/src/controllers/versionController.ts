import { Request, Response } from 'express';
import { VersionService } from '../services/versionService';

export const getItemVersions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { itemId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const versions = await VersionService.getItemVersions(itemId);
    return res.json(versions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProjectVersions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const versions = await VersionService.getProjectVersions(projectId);
    return res.json(versions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getItemVersion = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { itemId, versionNumber } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const version = await VersionService.getItemVersion(itemId, parseInt(versionNumber, 10));
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    return res.json(version);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProjectVersion = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectId, versionNumber } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const version = await VersionService.getProjectVersion(projectId, parseInt(versionNumber, 10));
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    return res.json(version);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

