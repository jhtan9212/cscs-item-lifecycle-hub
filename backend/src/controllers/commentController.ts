import { Request, Response } from 'express';
import prisma from '../config/database';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { projectId } = req.params;
    const { content, isInternal } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get user from authenticated request
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const actualUserId = user.id;
    const actualUserName = user.name;

    const comment = await prisma.comment.create({
      data: {
        projectId,
        userId: actualUserId,
        userName: actualUserName,
        content,
        isInternal: isInternal ?? true,
      },
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

