# Test Data Guide

This document outlines the test projects and items created for testing all user roles and features.

## Test Users

All users have the password: **`password123`**

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | `admin@cscs.com` | `password123` | All permissions |
| Category Manager | `cm@cscs.com` | `password123` | Project/Item management, workflow control |
| Pricing Specialist | `pricing@cscs.com` | `password123` | View projects/items, update pricing, submit pricing |
| Logistics | `logistics@cscs.com` | `password123` | View projects/items, update freight strategy |
| Strategic Supply Manager | `ssm@cscs.com` | `password123` | View projects/items, advance workflow, approve |

---

## Test Projects Created

### 1. **Logistics - Office Supplies Project**
- **Stage:** Freight Strategy
- **Lifecycle Type:** NEW_ITEM
- **Status:** IN_PROGRESS
- **Items:**
  - Premium Office Chair (needs freight strategy)
  - Standing Desk Converter (needs freight strategy)
- **What to Test:**
  - Login as `logistics@cscs.com`
  - Go to "My Tasks" - should see this project
  - Click "Set Freight Strategy"
  - Set freight strategy for each item
  - Submit freight strategy
  - Workflow should advance to next stage

### 2. **Pricing Specialist - Electronics Project**
- **Stage:** KINEXO Pricing
- **Lifecycle Type:** NEW_ITEM
- **Status:** IN_PROGRESS
- **Items:**
  - Wireless Mouse Pro (supplier price: $25.99, needs KINEXO price)
  - Mechanical Keyboard (supplier price: $89.99, needs KINEXO price)
  - USB-C Hub (supplier price: $45.50, needs KINEXO price)
- **What to Test:**
  - Login as `pricing@cscs.com`
  - Go to "My Tasks" - should see this project
  - Click "Review Pricing"
  - Set KINEXO pricing for each item
  - Submit pricing for approval
  - Workflow should advance to CM Approval stage

### 3. **Strategic Supply Manager - IT Equipment Project**
- **Stage:** SSM Approval
- **Lifecycle Type:** NEW_ITEM
- **Status:** IN_PROGRESS
- **Items:**
  - Network Switch 24-Port (pricing complete, ready for approval)
  - Wireless Access Point (pricing complete, ready for approval)
- **What to Test:**
  - Login as `ssm@cscs.com`
  - Go to "My Tasks" - should see this project
  - Review project details
  - Use workflow controls to approve
  - Workflow should advance to "In Transition" stage

### 4. **Category Manager - Kitchen Supplies Project**
- **Stage:** Draft
- **Lifecycle Type:** NEW_ITEM
- **Status:** DRAFT
- **Items:**
  - Coffee Maker Commercial
  - Microwave Oven
- **What to Test:**
  - Login as `cm@cscs.com`
  - Go to "Projects" or "My Tasks"
  - View project details
  - Add/edit items
  - Advance workflow to next stage (Freight Strategy)
  - Test project creation and management

### 5. **Category Manager - Cleaning Supplies Project**
- **Stage:** CM Approval
- **Lifecycle Type:** NEW_ITEM
- **Status:** IN_PROGRESS
- **Items:**
  - All-Purpose Cleaner (pricing complete)
  - Paper Towels Bulk (pricing complete)
- **What to Test:**
  - Login as `cm@cscs.com`
  - Go to "My Tasks" - should see this project
  - Review project at CM Approval stage
  - Approve or move back workflow
  - Test approval workflow

### 6. **Pricing Specialist - Office Furniture Transition Project**
- **Stage:** KINEXO Pricing
- **Lifecycle Type:** TRANSITIONING_ITEM
- **Status:** IN_PROGRESS
- **Items:**
  - Conference Table (Updated) (supplier price: $599.99, needs KINEXO price)
- **What to Test:**
  - Login as `pricing@cscs.com`
  - Go to "My Tasks" - should see this project
  - Test pricing workflow for transitioning items
  - Different lifecycle type workflow

---

## Testing Workflow by Role

### Admin (`admin@cscs.com`)
**What to Test:**
- ✅ View all projects (no restrictions)
- ✅ Access role management
- ✅ Manage users and permissions
- ✅ View all workflow stages
- ✅ Can perform any action on any project

**Test Steps:**
1. Login as admin
2. Navigate to "Role Management" - manage permissions
3. View all projects - should see all 6 test projects
4. Test full access to all features

---

### Category Manager (`cm@cscs.com`)
**What to Test:**
- ✅ Create new projects
- ✅ Edit projects and items
- ✅ Advance workflow stages
- ✅ Approve projects at CM Approval stage
- ❌ Cannot delete projects
- ❌ Cannot manage users/roles

**Test Steps:**
1. Login as Category Manager
2. Go to "My Tasks" - should see projects at Draft and CM Approval stages
3. Create a new project
4. Add items to projects
5. Advance workflow from Draft to Freight Strategy
6. Approve project at CM Approval stage

---

### Pricing Specialist (`pricing@cscs.com`)
**What to Test:**
- ✅ View projects at KINEXO Pricing stage
- ✅ Update item pricing (KINEXO price)
- ✅ Submit pricing for approval
- ✅ View supplier pricing (read-only)
- ❌ Cannot create projects
- ❌ Cannot advance workflow (except through pricing submission)

**Test Steps:**
1. Login as Pricing Specialist
2. Go to "My Tasks" - should see 2 projects at KINEXO Pricing stage
3. Click "Review Pricing" on a project
4. Set KINEXO pricing for each item
5. Submit pricing - workflow should advance automatically
6. Verify cannot see projects at other stages in "My Tasks"

---

### Logistics (`logistics@cscs.com`)
**What to Test:**
- ✅ View projects at Freight Strategy stage
- ✅ Update freight strategy for items
- ✅ Submit freight strategy
- ✅ View project and item details
- ❌ Cannot create projects
- ❌ Cannot set pricing

**Test Steps:**
1. Login as Logistics
2. Go to "My Tasks" - should see project at Freight Strategy stage
3. Click "Set Freight Strategy"
4. Set freight strategy for each item
5. Optionally set freight brackets (JSON format)
6. Submit freight strategy - workflow should advance

---

### Strategic Supply Manager (`ssm@cscs.com`)
**What to Test:**
- ✅ View projects at SSM Approval stage
- ✅ Advance workflow (approve)
- ✅ Move workflow back if needed
- ✅ View all project details
- ❌ Cannot create projects
- ❌ Cannot set pricing or freight

**Test Steps:**
1. Login as Strategic Supply Manager
2. Go to "My Tasks" - should see project at SSM Approval stage
3. Review project details
4. Use workflow controls to approve
5. Workflow should advance to "In Transition" stage

---

## Testing Scenarios

### Scenario 1: Complete Workflow for New Item
1. **Category Manager** creates project → Draft stage
2. **Category Manager** adds items and advances → Freight Strategy stage
3. **Logistics** sets freight strategy and submits → Supplier Pricing stage
4. (Supplier stage - simulated as completed) → KINEXO Pricing stage
5. **Pricing Specialist** sets KINEXO pricing and submits → CM Approval stage
6. **Category Manager** approves → SSM Approval stage
7. **Strategic Supply Manager** approves → In Transition stage
8. (DC Operator stage - not implemented) → Completed

### Scenario 2: Pricing Workflow
1. Login as **Pricing Specialist**
2. View "My Tasks" - see projects requiring pricing
3. Open pricing interface
4. Review supplier pricing (read-only)
5. Set KINEXO pricing for each item
6. Submit pricing - automatically advances workflow

### Scenario 3: Freight Strategy Workflow
1. Login as **Logistics**
2. View "My Tasks" - see project requiring freight strategy
3. Open freight strategy interface
4. Set freight strategy for each item
5. Optionally configure freight brackets
6. Submit freight strategy - automatically advances workflow

### Scenario 4: Approval Workflow
1. Login as **Strategic Supply Manager**
2. View "My Tasks" - see project requiring approval
3. Review project details and items
4. Use workflow controls to approve or reject
5. If approved, workflow advances; if rejected, can move back

---

## Expected Results

### My Tasks Page
- Each role should only see projects at stages requiring their role
- Projects should be sorted by most recent update
- Direct action buttons should appear based on stage

### Permission Enforcement
- UI elements should be hidden/disabled based on permissions
- API calls should return 403 Forbidden for unauthorized actions
- Error messages should be user-friendly

### Workflow Progression
- Each stage should require the correct role
- Workflow should advance automatically when role-specific tasks are completed
- All workflow changes should be logged in audit trail

---

## Notes

- **Re-seeding:** Run `cd backend && npx prisma db seed` to reset test data
- **Fresh Login:** After re-seeding, users should log out and log back in to refresh permissions
- **Workflow Stages:** Projects are pre-configured at specific stages for testing
- **Items:** Each project has 1-3 items with appropriate field ownership
- **Permissions:** All permissions are correctly assigned in seed data

---

## Quick Test Checklist

- [ ] Admin can access all features
- [ ] Category Manager can create projects and manage items
- [ ] Pricing Specialist can set and submit pricing
- [ ] Logistics can set freight strategy
- [ ] Strategic Supply Manager can approve projects
- [ ] "My Tasks" shows correct projects for each role
- [ ] Workflow advances correctly after role-specific actions
- [ ] Permissions are enforced in UI and API
- [ ] Error messages are clear and helpful

