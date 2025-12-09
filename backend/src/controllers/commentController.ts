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
    const { projectId } = req.params;
    const { content, userId, userName, isInternal } = req.body;

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

    // Use provided userId or default
    let actualUserId = userId;
    let actualUserName = userName;

    if (!actualUserId || !actualUserName) {
      const adminUser = await prisma.user.findFirst({
        where: {
          role: {
            isAdmin: true,
          },
        },
      });
      actualUserId = adminUser?.id || 'system';
      actualUserName = adminUser?.name || 'System';
    }

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

