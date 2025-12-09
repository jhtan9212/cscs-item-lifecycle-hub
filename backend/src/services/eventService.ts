import prisma from '../config/database';
import { logger } from '../utils/logger';
import { EventStatus } from '@prisma/client';

export interface LifecycleEventPayload {
  entityType: string;
  entityId: string;
  action: string;
  data?: any;
  userId?: string;
}

export class EventService {
  /**
   * Create a lifecycle event
   */
  static async createEvent(
    eventType: string,
    payload: LifecycleEventPayload
  ): Promise<string> {
    try {
      const event = await prisma.lifecycleEvent.create({
        data: {
          eventType,
          entityType: payload.entityType,
          entityId: payload.entityId,
          payload: JSON.stringify(payload),
          status: EventStatus.PENDING,
        },
      });

      logger.info('Lifecycle event created', {
        eventId: event.id,
        eventType,
        entityType: payload.entityType,
        entityId: payload.entityId,
      });

      // Process event asynchronously (fire and forget)
      this.processEvent(event.id).catch((error) => {
        logger.error('Error processing event:', { eventId: event.id, error: error.message });
      });

      return event.id;
    } catch (error: any) {
      logger.error('Error creating lifecycle event:', { eventType, error: error.message });
      throw error;
    }
  }

  /**
   * Process a lifecycle event asynchronously
   */
  private static async processEvent(eventId: string): Promise<void> {
    try {
      // Mark event as processing
      await prisma.lifecycleEvent.update({
        where: { id: eventId },
        data: { status: EventStatus.PROCESSING },
      });

      const event = await prisma.lifecycleEvent.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      const payload: LifecycleEventPayload = JSON.parse(event.payload);

      // Process based on event type
      switch (event.eventType) {
        case 'WORKFLOW_ADVANCE':
          await this.handleWorkflowAdvance(payload);
          break;
        case 'WORKFLOW_MOVE_BACK':
          await this.handleWorkflowMoveBack(payload);
          break;
        case 'ITEM_UPDATE':
          await this.handleItemUpdate(payload);
          break;
        case 'PROJECT_UPDATE':
          await this.handleProjectUpdate(payload);
          break;
        default:
          logger.warn('Unknown event type:', { eventType: event.eventType });
      }

      // Mark event as completed
      await prisma.lifecycleEvent.update({
        where: { id: eventId },
        data: {
          status: EventStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      logger.info('Event processed successfully', { eventId });
    } catch (error: any) {
      // Mark event as failed
      await prisma.lifecycleEvent.update({
        where: { id: eventId },
        data: {
          status: EventStatus.FAILED,
          errorMessage: error.message,
          processedAt: new Date(),
        },
      });

      logger.error('Error processing event:', { eventId, error: error.message });
      throw error;
    }
  }

  /**
   * Handle workflow advance events
   */
  private static async handleWorkflowAdvance(payload: LifecycleEventPayload): Promise<void> {
    // Additional async processing for workflow advances
    // e.g., send external notifications, update external systems, etc.
    logger.info('Processing workflow advance event', { payload });
  }

  /**
   * Handle workflow move back events
   */
  private static async handleWorkflowMoveBack(payload: LifecycleEventPayload): Promise<void> {
    logger.info('Processing workflow move back event', { payload });
  }

  /**
   * Handle item update events
   */
  private static async handleItemUpdate(payload: LifecycleEventPayload): Promise<void> {
    logger.info('Processing item update event', { payload });
  }

  /**
   * Handle project update events
   */
  private static async handleProjectUpdate(payload: LifecycleEventPayload): Promise<void> {
    logger.info('Processing project update event', { payload });
  }

  /**
   * Get events for an entity
   */
  static async getEntityEvents(entityType: string, entityId: string, limit = 50) {
    try {
      return await prisma.lifecycleEvent.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error: any) {
      logger.error('Error fetching entity events:', { entityType, entityId, error: error.message });
      throw error;
    }
  }

  /**
   * Get pending events
   */
  static async getPendingEvents(limit = 100) {
    try {
      return await prisma.lifecycleEvent.findMany({
        where: { status: EventStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });
    } catch (error: any) {
      logger.error('Error fetching pending events:', { error: error.message });
      throw error;
    }
  }
}

