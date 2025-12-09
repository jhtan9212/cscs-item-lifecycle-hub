# Workflow Reference Guide

## Workflow Stages by Lifecycle Type

### New Item Lifecycle

```
1. Draft
   - Description: Initial project creation
   - Required Role: Category Manager
   - Actions: Create project, add basic info
   - Can Advance: When project name and description are set

2. Freight Strategy
   - Description: Logistics analysis
   - Required Role: Logistics
   - Actions: Submit freight requirements, brackets
   - Can Advance: When freight strategy is submitted

3. Supplier Pricing
   - Description: Supplier quotes
   - Required Role: Supplier
   - Actions: Submit item details, pricing, freight brackets
   - Can Advance: When supplier pricing is submitted

4. KINEXO Pricing
   - Description: Internal pricing
   - Required Role: Pricing Specialist
   - Actions: Review supplier pricing, set internal pricing
   - Can Advance: When KINEXO pricing is set and approved

5. CM Approval
   - Description: Category Manager review
   - Required Role: Category Manager
   - Actions: Review all data, approve or reject
   - Can Advance: When approved (or move back if rejected)

6. SSM Approval
   - Description: Strategic Supply review
   - Required Role: Strategic Supply Manager
   - Actions: Final review, approve or reject
   - Can Advance: When approved (or move back if rejected)

7. In Transition
   - Description: DC setup
   - Required Role: DC Operator
   - Actions: Complete DC transition setup
   - Can Advance: When all DCs complete setup

8. Completed
   - Description: Project complete
   - Required Role: None (automatic)
   - Actions: View only
   - Final State: Cannot advance further
```

### Transitioning Item Lifecycle

```
1. Draft
   - Description: Initial transition project creation
   - Required Role: Category Manager
   - Actions: Create project, identify item to transition

2. Item Comparison
   - Description: Compare old vs new item specs
   - Required Role: Category Manager
   - Actions: Document changes, impact analysis

3. Freight Strategy
   - Description: Updated logistics requirements
   - Required Role: Logistics
   - Actions: Update freight strategy for transition

4. Supplier Pricing
   - Description: New supplier pricing
   - Required Role: Supplier
   - Actions: Submit updated pricing

5. KINEXO Pricing
   - Description: Internal pricing update
   - Required Role: Pricing Specialist
   - Actions: Review and approve pricing

6. CM Approval
   - Description: Category Manager review
   - Required Role: Category Manager

7. SSM Approval
   - Description: Strategic Supply review
   - Required Role: Strategic Supply Manager

8. DC Transition
   - Description: DC transition execution
   - Required Role: DC Operator
   - Actions: Execute transition, manage runout

9. Completed
   - Description: Transition complete
   - Final State
```

### Deleting Item Lifecycle

```
1. Draft
   - Description: Deletion request
   - Required Role: Category Manager
   - Actions: Create deletion project, identify item

2. Impact Analysis
   - Description: Assess deletion impact
   - Required Role: Category Manager
   - Actions: Document impact, alternatives

3. SSM Review
   - Description: Strategic Supply review
   - Required Role: Strategic Supply Manager
   - Actions: Review impact, approve deletion

4. DC Runout
   - Description: Manage inventory runout
   - Required Role: DC Operator
   - Actions: Complete inventory depletion

5. Archive
   - Description: Archive item data
   - Required Role: Admin
   - Actions: Archive item, update systems

6. Completed
   - Description: Deletion complete
   - Final State
```

## Workflow Rules

### Advancement Rules
1. **Sequential Progression**: Must complete stages in order
2. **Role Requirement**: Specific role must complete each stage
3. **Data Validation**: Required fields must be filled before advancement
4. **Dependencies**: Some stages depend on previous stage completion

### Regression Rules
1. **Internal Users Only**: Only Internal CSCS users can move stages back
2. **Reset Dependent Stages**: Moving back resets all subsequent stages
3. **Audit Trail**: All regressions are logged
4. **Comments Required**: Should provide reason for moving back

### Approval/Rejection Rules
1. **Approval**: Advances to next stage
2. **Rejection**: Can move back or request resubmission
3. **Resubmission**: Returns to previous stage for corrections
4. **Notifications**: All parties are notified of status changes

## Field Ownership by Role

### Category Manager Fields
- Item Number (CM)
- Description (CM)
- Category
- Project Name
- Project Description

### Strategic Supply Manager Fields
- Supplier Assignment
- Distribution Center Connections
- Freight Brackets (DC level)
- Transition Management

### Pricing Specialist Fields
- Supplier Price
- KINEXO Price
- Pricing Status
- Pricing Approval

### Logistics Fields
- Freight Strategy
- Freight Brackets (initial)
- Shipping Requirements
- Transportation Analysis

### Supplier Fields
- Supplier Item Number
- Supplier Specifications
- Supplier Pricing
- Supplier Freight Brackets

### DC Operator Fields
- DC Status
- DC Setup Completion
- DC Notes
- Transition Status

## Status Definitions

### Project Status
- **DRAFT**: Initial creation, not yet started
- **IN_PROGRESS**: Active workflow, stages being completed
- **WAITING_ON_SUPPLIER**: Blocked, waiting for supplier input
- **WAITING_ON_DISTRIBUTOR**: Blocked, waiting for distributor/DC input
- **INTERNAL_REVIEW**: Internal CSCS review in progress
- **COMPLETED**: All stages complete, project finished
- **REJECTED**: Project rejected, may be restarted

### Step Status
- **PENDING**: Not yet started
- **IN_PROGRESS**: Currently being worked on
- **COMPLETED**: Step finished successfully
- **REJECTED**: Step rejected, needs correction
- **SKIPPED**: Step skipped (if applicable)

## Workflow Engine Logic

### Can Advance Check
```typescript
function canAdvance(project: Project, user: User): boolean {
  // 1. Check user has required role for current stage
  const currentStep = getCurrentStep(project);
  if (currentStep.requiredRole && user.role.name !== currentStep.requiredRole) {
    return false;
  }
  
  // 2. Check current stage is complete
  if (currentStep.status !== 'COMPLETED') {
    return false;
  }
  
  // 3. Check required data is present
  if (!validateStageData(project, currentStep)) {
    return false;
  }
  
  // 4. Check not at final stage
  if (isFinalStage(project)) {
    return false;
  }
  
  return true;
}
```

### Advance Workflow
```typescript
async function advanceWorkflow(projectId: string, userId: string) {
  // 1. Get current project state
  const project = await getProject(projectId);
  const currentStep = getCurrentStep(project);
  
  // 2. Validate can advance
  if (!canAdvance(project, user)) {
    throw new Error('Cannot advance workflow');
  }
  
  // 3. Mark current step as completed
  await updateStepStatus(currentStep.id, 'COMPLETED', userId);
  
  // 4. Move to next step
  const nextStep = getNextStep(project);
  await updateStepStatus(nextStep.id, 'IN_PROGRESS', userId);
  
  // 5. Update project current stage
  await updateProjectStage(projectId, nextStep.stepName);
  
  // 6. Create audit log
  await createAuditLog({
    projectId,
    userId,
    action: 'ADVANCE_WORKFLOW',
    changes: {
      from: currentStep.stepName,
      to: nextStep.stepName
    }
  });
  
  // 7. Send notifications (Part 2)
  await notifyStageChange(project, nextStep);
  
  return project;
}
```

## Common Workflow Patterns

### Approval Pattern
1. Submit for approval
2. Reviewer receives notification
3. Reviewer approves or rejects
4. If approved: advance to next stage
5. If rejected: move back or request resubmission

### Waiting Pattern
1. Stage requires external input
2. Project status changes to WAITING_ON_*
3. External party completes action
4. Project status returns to IN_PROGRESS
5. Continue workflow

### Parallel Pattern (Advanced)
- Multiple stages can be worked on simultaneously
- All must complete before advancing
- Example: Multiple DC setups in parallel

## Error Handling

### Invalid Advancement
- Return error with reason
- Log attempt
- Notify user of requirements

### Missing Data
- Highlight required fields
- Prevent advancement
- Show validation errors

### Permission Denied
- Return 403 error
- Log unauthorized attempt
- Show user-friendly message

