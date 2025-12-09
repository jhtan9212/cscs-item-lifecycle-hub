/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "item_versions" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_versions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "relatedProjectId" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedToId" TEXT,
    "assignedRole" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifecycle_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lifecycle_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "item_versions_itemId_versionNumber_idx" ON "item_versions"("itemId", "versionNumber");

-- CreateIndex
CREATE INDEX "project_versions_projectId_versionNumber_idx" ON "project_versions"("projectId", "versionNumber");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_assignedToId_status_idx" ON "tasks"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "tasks_status_dueDate_idx" ON "tasks"("status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "lifecycle_events_eventType_status_idx" ON "lifecycle_events"("eventType", "status");

-- CreateIndex
CREATE INDEX "lifecycle_events_entityType_entityId_idx" ON "lifecycle_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "lifecycle_events_createdAt_idx" ON "lifecycle_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "organizations"("domain");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_projectId_idx" ON "audit_logs"("projectId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_lifecycleType_idx" ON "projects"("lifecycleType");

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- CreateIndex
CREATE INDEX "projects_organizationId_idx" ON "projects"("organizationId");

-- CreateIndex
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_versions" ADD CONSTRAINT "item_versions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
