# Multi-Tenant Feature - Comprehensive Test Guide

## 📋 Overview

This guide provides detailed test instructions for the **Multi-Tenant Architecture** feature, which enables organization-based data isolation and management.

## ✅ Implementation Summary

### Backend Implementation
- ✅ Organization model in database schema
- ✅ Organization CRUD operations (Admin only)
- ✅ Organization-based data filtering in all queries
- ✅ User-organization assignment
- ✅ Project-organization association
- ✅ Organization middleware for automatic filtering
- ✅ Updated authentication to include organization context

### Frontend Implementation
- ✅ Organization Management page (Admin only)
- ✅ Organization selection in User Management
- ✅ Organization display in user lists
- ✅ Organization filtering in all data views
- ✅ Navigation link for Organization Management

## 🚀 Pre-Testing Setup

### 1. Database Migration

```bash
cd backend
npx prisma migrate dev
# This will create the Organization table and add organizationId fields
```

### 2. Seed Database

```bash
cd backend
npx prisma db seed
# This creates 3 test organizations and assigns users/projects to them
```

### 3. Verify Seed Data

After seeding, you should have:
- **3 Organizations:**
  - KINEXO Corporation (org-1)
  - Partner Organization A (org-2)
  - Partner Organization B (org-3)

- **Users assigned to organizations:**
  - Most users → KINEXO Corporation (org-1)
  - Supplier user → Partner Organization A (org-2)

- **Projects assigned to organizations:**
  - Most projects → KINEXO Corporation (org-1)
  - Supplier project → Partner Organization A (org-2)

---

## 🧪 Test Cases

### Test Suite 1: Organization Management (Admin Only)

#### Test Case 1.1: Access Organization Management

**Steps:**
1. Login as Admin (`admin@cscs.com` / `password123`)
2. Check sidebar navigation
3. Look for "Organization Management" link in Administration section
4. Click on "Organization Management"

**Expected Results:**
- ✅ "Organization Management" link appears in sidebar (Admin only)
- ✅ Link navigates to `/organization-management`
- ✅ Page loads successfully
- ✅ Shows organization management interface

#### Test Case 1.2: View All Organizations

**Steps:**
1. Navigate to Organization Management page
2. Review the organizations table

**Expected Results:**
- ✅ Table displays all organizations
- ✅ Shows organization name, domain, user count, project count
- ✅ Shows organization status (Active/Inactive)
- ✅ Shows creation date
- ✅ Displays action buttons (Edit, Delete)

#### Test Case 1.3: Create New Organization

**Steps:**
1. Click "Create Organization" button
2. Fill in form:
   - Name: "Test Organization C"
   - Domain: "testorgc.com" (optional)
3. Click "Create Organization"

**Expected Results:**
- ✅ Organization is created successfully
- ✅ Success toast notification appears
- ✅ Organization appears in the list
- ✅ Form closes after creation
- ✅ Organization is active by default

**Test Validation:**
- [ ] Try creating organization with duplicate domain (should fail)
- [ ] Try creating organization without name (should validate)
- [ ] Try creating organization with empty domain (should work)

#### Test Case 1.4: Edit Organization

**Steps:**
1. Click "Edit" button on an organization
2. Update organization name and/or domain
3. Click "Save Changes"

**Expected Results:**
- ✅ Edit dialog opens with current values
- ✅ Changes are saved successfully
- ✅ Success toast notification appears
- ✅ Organization list updates with new values
- ✅ Domain uniqueness is validated

#### Test Case 1.5: Toggle Organization Status

**Steps:**
1. Find an active organization
2. Toggle the status switch to inactive
3. Verify status changes

**Expected Results:**
- ✅ Status switch toggles successfully
- ✅ Badge updates to show "Inactive"
- ✅ Success toast notification appears
- ✅ Can toggle back to active

#### Test Case 1.6: Delete Organization

**Steps:**
1. Create a new organization (without users/projects)
2. Click "Delete" button
3. Confirm deletion

**Expected Results:**
- ✅ Organization is deleted successfully
- ✅ Success toast notification appears
- ✅ Organization removed from list

**Test Validation:**
- [ ] Try deleting organization with users (should fail with error message)
- [ ] Try deleting organization with projects (should fail with error message)
- [ ] Delete button should be disabled for organizations with users/projects

#### Test Case 1.7: View Organization Users

**Steps:**
1. Click on an organization in the list
2. View user count
3. (If API endpoint exists) View detailed user list

**Expected Results:**
- ✅ User count is accurate
- ✅ Can see which users belong to organization
- ✅ User list is filtered by organization

#### Test Case 1.8: Non-Admin Access Restriction

**Steps:**
1. Login as Category Manager (`cm@cscs.com`)
2. Try to access `/organization-management` directly via URL
3. Try to access organization API endpoints

**Expected Results:**
- ✅ "Organization Management" link does NOT appear in sidebar
- ✅ Direct URL access is blocked (403 Forbidden or redirect)
- ✅ API endpoints return 403 Forbidden
- ✅ Clear error message about insufficient permissions

---

### Test Suite 2: User-Organization Assignment

#### Test Case 2.1: Assign User to Organization (Admin)

**Steps:**
1. Login as Admin
2. Navigate to User Management
3. Create a new user:
   - Name: "Test User Org"
   - Email: "testorg@cscs.com"
   - Password: "password123"
   - Role: "Category Manager"
   - Organization: Select "KINEXO Corporation"
4. Submit form

**Expected Results:**
- ✅ User is created with selected organization
- ✅ Organization appears in user list
- ✅ User is assigned to organization correctly

#### Test Case 2.2: Update User Organization

**Steps:**
1. In User Management, find a user
2. Click "Edit"
3. Change organization assignment
4. Save changes

**Expected Results:**
- ✅ Organization assignment updates successfully
- ✅ User list shows new organization
- ✅ Changes are persisted

#### Test Case 2.3: View Users by Organization

**Steps:**
1. Login as Admin
2. View User Management page
3. Check organization column in user table

**Expected Results:**
- ✅ Organization column displays for each user
- ✅ Shows organization name or "—" if no organization
- ✅ Organization badges are visible

#### Test Case 2.4: Non-Admin User Creation

**Steps:**
1. Login as Category Manager (non-admin)
2. Navigate to User Management (if has permission)
3. Create a new user
4. Check organization assignment

**Expected Results:**
- ✅ Non-admin users can only create users in their own organization
- ✅ Organization field is automatically set (not selectable)
- ✅ Cannot assign users to other organizations

---

### Test Suite 3: Project-Organization Association

#### Test Case 3.1: Project Creation with Organization

**Steps:**
1. Login as Category Manager (assigned to org-1)
2. Create a new project
3. Verify project organization

**Expected Results:**
- ✅ Project is automatically assigned to user's organization
- ✅ Project appears in organization's project list
- ✅ Organization is set correctly in database

#### Test Case 3.2: View Projects by Organization

**Steps:**
1. Login as Category Manager (org-1)
2. Navigate to Projects page
3. View project list

**Expected Results:**
- ✅ Only sees projects from org-1
- ✅ Does NOT see projects from org-2 or org-3
- ✅ Project count matches organization's projects

#### Test Case 3.3: Admin View All Organizations' Projects

**Steps:**
1. Login as Admin
2. Navigate to Projects page
3. View project list

**Expected Results:**
- ✅ Sees projects from ALL organizations
- ✅ Can see projects from org-1, org-2, and org-3
- ✅ Project list includes organization information

#### Test Case 3.4: Cross-Organization Project Access

**Steps:**
1. Login as Category Manager (org-1)
2. Try to access a project from org-2 (use project ID from seed data)
3. Try to view project details

**Expected Results:**
- ✅ Cannot access project from different organization
- ✅ Returns 403 Forbidden or "Project not found"
- ✅ Clear error message about access restriction

#### Test Case 3.5: Project Filtering in Dashboard

**Steps:**
1. Login as Category Manager (org-1)
2. View Dashboard
3. Check statistics:
   - Total Projects
   - Active Projects
   - Recent Projects

**Expected Results:**
- ✅ Statistics only include projects from org-1
- ✅ Recent Projects only shows org-1 projects
- ✅ Counts are accurate for organization

#### Test Case 3.6: Admin Dashboard Statistics

**Steps:**
1. Login as Admin
2. View Dashboard
3. Check statistics

**Expected Results:**
- ✅ Statistics include projects from ALL organizations
- ✅ Recent Projects shows projects from all orgs
- ✅ Counts are accurate across all organizations

---

### Test Suite 4: Data Isolation Testing

#### Test Case 4.1: User Isolation

**Steps:**
1. Login as Category Manager (org-1)
2. Navigate to User Management (if has permission)
3. View user list

**Expected Results:**
- ✅ Only sees users from org-1
- ✅ Does NOT see users from org-2 or org-3
- ✅ User count matches organization's users

#### Test Case 4.2: My Tasks Isolation

**Steps:**
1. Login as Supplier (org-2)
2. Navigate to My Tasks
3. View assigned projects

**Expected Results:**
- ✅ Only sees projects from org-2
- ✅ Sees "Office Equipment - Supplier Pricing" project (from seed)
- ✅ Does NOT see projects from org-1

#### Test Case 4.3: Dashboard Isolation

**Steps:**
1. Login as different users from different organizations:
   - Category Manager (org-1)
   - Supplier (org-2)
2. Compare dashboard statistics

**Expected Results:**
- ✅ Each user sees only their organization's data
- ✅ Statistics are organization-specific
- ✅ No cross-organization data leakage

#### Test Case 4.4: API Endpoint Isolation

**Steps:**
1. Login as Category Manager (org-1)
2. Use API to fetch:
   - GET `/api/projects`
   - GET `/api/projects/my-assigned`
   - GET `/api/users`
3. Check response data

**Expected Results:**
- ✅ All endpoints filter by organization
- ✅ Only returns data from user's organization
- ✅ No data from other organizations in response

#### Test Case 4.5: Admin Cross-Organization Access

**Steps:**
1. Login as Admin
2. Access projects from different organizations
3. Access users from different organizations
4. Verify can see all data

**Expected Results:**
- ✅ Admin can access all organizations' data
- ✅ Admin sees all projects regardless of organization
- ✅ Admin sees all users regardless of organization
- ✅ Admin can manage all organizations

---

### Test Suite 5: Organization Assignment Workflows

#### Test Case 5.1: Assign Existing User to Organization

**Steps:**
1. Login as Admin
2. Navigate to User Management
3. Find a user without organization
4. Edit user and assign to organization
5. Save changes

**Expected Results:**
- ✅ User is assigned to organization successfully
- ✅ User's existing projects remain in their original organization (if any)
- ✅ User can now only see projects from new organization

#### Test Case 5.2: Migrate User Between Organizations

**Steps:**
1. Login as Admin
2. Find user in org-1
3. Change user's organization to org-2
4. Login as that user
5. Verify data access

**Expected Results:**
- ✅ User organization is updated
- ✅ User can now only see org-2 projects
- ✅ User cannot access org-1 projects anymore
- ✅ User's created projects remain in org-1 (projects don't auto-migrate)

#### Test Case 5.3: Assign Project to Organization

**Steps:**
1. Login as Admin
2. Find a project without organization
3. Update project to assign to organization
4. Verify project appears in organization's list

**Expected Results:**
- ✅ Project can be assigned to organization
- ✅ Project appears in organization's project list
- ✅ Users from that organization can now see the project

---

### Test Suite 6: Edge Cases and Error Handling

#### Test Case 6.1: User Without Organization

**Steps:**
1. Create a user without organization assignment
2. Login as that user
3. Try to create a project
4. Verify project creation

**Expected Results:**
- ✅ User can login successfully
- ✅ Project is created without organization (organizationId = null)
- ✅ User can see their own projects
- ✅ Other users cannot see unassigned user's projects

#### Test Case 6.2: Project Without Organization

**Steps:**
1. Create a project as user without organization
2. Assign user to organization
3. Verify project remains without organization

**Expected Results:**
- ✅ Project can exist without organization
- ✅ Project organization doesn't auto-update when user is assigned
- ✅ Project remains accessible to creator

#### Test Case 6.3: Deactivate Organization

**Steps:**
1. Login as Admin
2. Deactivate an organization (set isActive = false)
3. Login as user from that organization
4. Verify user access

**Expected Results:**
- ✅ Organization can be deactivated
- ✅ Users from deactivated organization can still login
- ✅ Users can still access their data
- ✅ Organization status is visible in UI

#### Test Case 6.4: Delete Organization with Data

**Steps:**
1. Try to delete organization with users
2. Try to delete organization with projects

**Expected Results:**
- ✅ Deletion is prevented
- ✅ Error message: "Cannot delete organization with users or projects"
- ✅ Delete button is disabled for organizations with data
- ✅ Suggestion to deactivate instead

---

### Test Suite 7: Integration Testing

#### Test Case 7.1: Complete Multi-Organization Workflow

**Steps:**
1. **Setup:**
   - Create Organization A and Organization B
   - Create User A in Org A (Category Manager)
   - Create User B in Org B (Category Manager)

2. **Org A Workflow:**
   - Login as User A
   - Create project "Project A"
   - Add items to project
   - Advance workflow

3. **Org B Workflow:**
   - Login as User B
   - Create project "Project B"
   - Add items to project
   - Advance workflow

4. **Verify Isolation:**
   - Login as User A → Should only see Project A
   - Login as User B → Should only see Project B
   - Login as Admin → Should see both projects

**Expected Results:**
- ✅ Each organization's workflow operates independently
- ✅ No data leakage between organizations
- ✅ Admin can see all organizations' data
- ✅ Users are properly isolated

#### Test Case 7.2: Cross-Organization Collaboration (Blocked)

**Steps:**
1. User A (org-1) creates project
2. Try to assign User B (org-2) to project
3. User B tries to access project

**Expected Results:**
- ✅ Users from different organizations cannot collaborate on same project
- ✅ Project assignment is restricted to same organization
- ✅ Cross-organization access is blocked

#### Test Case 7.3: Organization Statistics Accuracy

**Steps:**
1. Login as Admin
2. View Organization Management
3. Check user and project counts for each organization
4. Verify counts match actual data

**Expected Results:**
- ✅ User counts are accurate
- ✅ Project counts are accurate
- ✅ Counts update in real-time
- ✅ Statistics reflect current organization state

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Organization model exists in database
- [ ] Users have organizationId field
- [ ] Projects have organizationId field
- [ ] All queries filter by organization (except Admin)
- [ ] Organization routes are protected (Admin only)
- [ ] User creation assigns organization correctly
- [ ] Project creation assigns organization correctly
- [ ] Dashboard statistics filter by organization
- [ ] My Tasks filters by organization
- [ ] API endpoints respect organization boundaries

### Frontend Verification
- [ ] Organization Management page exists and is accessible (Admin only)
- [ ] Organization list displays correctly
- [ ] Can create, edit, delete organizations
- [ ] User Management shows organization column
- [ ] Can assign users to organizations
- [ ] Projects list filters by organization
- [ ] Dashboard statistics are organization-specific
- [ ] Navigation includes Organization Management link (Admin only)
- [ ] Non-admin users cannot access organization management

### Data Isolation Verification
- [ ] Users only see their organization's projects
- [ ] Users only see their organization's users (if has permission)
- [ ] Projects are properly scoped to organizations
- [ ] Dashboard statistics are organization-specific
- [ ] My Tasks shows only organization's projects
- [ ] Admin can see all organizations' data
- [ ] Cross-organization access is blocked

---

## 🐛 Common Issues and Troubleshooting

### Issue 1: Users See All Projects
**Cause:** Organization filtering not applied in query
**Solution:** Verify `organizationId` filter is added to project queries

### Issue 2: Cannot Create Organization
**Cause:** Not logged in as Admin
**Solution:** Ensure user has Admin role

### Issue 3: Organization Not Appearing in Dropdown
**Cause:** Organizations not loaded or user not Admin
**Solution:** Check organization service is called, verify Admin access

### Issue 4: Projects Not Filtered by Organization
**Cause:** Organization filter not applied in controller
**Solution:** Verify `orgFilter` is added to all project queries

### Issue 5: User Cannot See Their Projects
**Cause:** User's organizationId doesn't match project's organizationId
**Solution:** Verify user and project are in same organization

---

## 📊 Test Data Reference

### Organizations (After Seed)
- **KINEXO Corporation** (org-1)
  - Domain: kinexo.com
  - Users: Admin, Category Manager, SSM, Pricing, Logistics, DC Operator
  - Projects: Most test projects

- **Partner Organization A** (org-2)
  - Domain: partnera.com
  - Users: Supplier
  - Projects: Office Equipment - Supplier Pricing

- **Partner Organization B** (org-3)
  - Domain: partnerb.com
  - Users: None (for testing)
  - Projects: None (for testing)

### Test Scenarios
1. **Same Organization Collaboration:**
   - Category Manager (org-1) creates project
   - Logistics (org-1) can see and work on project
   - Pricing Specialist (org-1) can see and work on project

2. **Cross-Organization Isolation:**
   - Supplier (org-2) cannot see projects from org-1
   - Category Manager (org-1) cannot see projects from org-2
   - Admin can see all projects

3. **Organization Migration:**
   - Move user from org-1 to org-2
   - User loses access to org-1 projects
   - User gains access to org-2 projects (if any)

---

## ✅ Success Criteria

The multi-tenant feature is working correctly if:

1. ✅ Organizations can be created, edited, and managed (Admin only)
2. ✅ Users can be assigned to organizations
3. ✅ Projects are automatically assigned to creator's organization
4. ✅ Data is properly isolated by organization
5. ✅ Non-admin users only see their organization's data
6. ✅ Admin can see and manage all organizations' data
7. ✅ Cross-organization access is properly blocked
8. ✅ Dashboard and statistics are organization-specific
9. ✅ All API endpoints respect organization boundaries
10. ✅ UI clearly displays organization information

---

## 📝 Notes

- **Backward Compatibility:** Existing users and projects without organization (organizationId = null) will continue to work
- **Admin Override:** Admin users can see all organizations' data regardless of their own organization assignment
- **Organization Assignment:** New users created by non-admin users are automatically assigned to the creator's organization
- **Project Assignment:** Projects are automatically assigned to the creator's organization
- **Migration:** Existing data can be migrated to organizations by updating organizationId fields

---

**Last Updated:** December 2024
**Version:** 1.0 (Multi-Tenant Implementation)

