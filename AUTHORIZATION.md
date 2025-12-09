# Authorization & Permissions Guide

This document outlines the permissions and access levels for each role in the CSCS POC system.

## Test User Credentials

All users have the password: **`password123`**

---

## 1. Admin Role

**Email:** `admin@cscs.com`  
**Password:** `password123`

### Permissions: **ALL PERMISSIONS** (Full Access)

Admin role has access to all features and operations:

#### Projects
- ✅ **CREATE_PROJECT** - Create new projects
- ✅ **UPDATE_PROJECT** - Update existing projects
- ✅ **DELETE_PROJECT** - Delete projects
- ✅ **VIEW_PROJECT** - View all projects

#### Items
- ✅ **CREATE_ITEM** - Create new items
- ✅ **UPDATE_ITEM** - Update existing items
- ✅ **DELETE_ITEM** - Delete items
- ✅ **VIEW_ITEM** - View all items

#### Workflow
- ✅ **ADVANCE_WORKFLOW** - Advance workflow stages
- ✅ **MOVE_BACK_WORKFLOW** - Move workflow back to previous stages

#### Pricing
- ✅ **APPROVE_PRICING** - Approve pricing decisions
- ✅ **SUBMIT_PRICING** - Submit pricing for approval
- ✅ **VIEW_PRICING** - View pricing information

#### User Management
- ✅ **MANAGE_USERS** - Create, update, delete users
- ✅ **MANAGE_ROLES** - Manage roles
- ✅ **MANAGE_PERMISSIONS** - Manage permissions and role assignments

#### Audit
- ✅ **VIEW_AUDIT_LOGS** - View all audit logs

### Access Level
- Can access all pages and features
- Can manage role-based access control
- Can view audit logs
- No restrictions on any operations

---

## 2. Category Manager

**Email:** `cm@cscs.com`  
**Password:** `password123`

### Permissions: **Project & Item Management Focus**

#### Projects
- ✅ **CREATE_PROJECT** - Create new projects
- ✅ **UPDATE_PROJECT** - Update existing projects
- ✅ **VIEW_PROJECT** - View projects
- ❌ **DELETE_PROJECT** - Cannot delete projects

#### Items
- ✅ **CREATE_ITEM** - Create new items
- ✅ **UPDATE_ITEM** - Update existing items
- ✅ **VIEW_ITEM** - View items
- ❌ **DELETE_ITEM** - Cannot delete items

#### Workflow
- ✅ **ADVANCE_WORKFLOW** - Advance workflow stages
- ✅ **MOVE_BACK_WORKFLOW** - Move workflow back to previous stages

#### Pricing
- ✅ **APPROVE_PRICING** - Approve pricing decisions
- ✅ **VIEW_PRICING** - View pricing information
- ❌ **SUBMIT_PRICING** - Cannot submit pricing (may be restricted)

#### User Management
- ❌ **MANAGE_USERS** - Cannot manage users
- ❌ **MANAGE_ROLES** - Cannot manage roles
- ❌ **MANAGE_PERMISSIONS** - Cannot manage permissions

#### Audit
- ❌ **VIEW_AUDIT_LOGS** - Cannot view audit logs

### Access Level
- Primary responsibility: Project and item lifecycle management
- Can create and manage projects and items
- Can control workflow progression
- Can approve pricing
- Cannot manage users, roles, or view audit logs

---

## 3. Strategic Supply Manager

**Email:** `ssm@cscs.com`  
**Password:** `password123`

### Permissions: **View & Strategic Operations**

#### Projects
- ✅ **VIEW_PROJECT** - View projects
- ❌ **CREATE_PROJECT** - Cannot create projects
- ❌ **UPDATE_PROJECT** - Cannot update projects
- ❌ **DELETE_PROJECT** - Cannot delete projects

#### Items
- ✅ **VIEW_ITEM** - View items
- ❌ **CREATE_ITEM** - Cannot create items
- ❌ **UPDATE_ITEM** - Cannot update items
- ❌ **DELETE_ITEM** - Cannot delete items

#### Workflow
- ✅ **ADVANCE_WORKFLOW** - Advance workflow stages
- ❌ **MOVE_BACK_WORKFLOW** - Cannot move workflow back

#### Pricing
- ✅ **VIEW_PRICING** - View pricing information
- ❌ **APPROVE_PRICING** - Cannot approve pricing
- ❌ **SUBMIT_PRICING** - Cannot submit pricing

#### User Management
- ❌ **MANAGE_USERS** - Cannot manage users
- ❌ **MANAGE_ROLES** - Cannot manage roles
- ❌ **MANAGE_PERMISSIONS** - Cannot manage permissions

#### Audit
- ❌ **VIEW_AUDIT_LOGS** - Cannot view audit logs

### Access Level
- Can view projects, items, and pricing information
- Can advance workflow stages
- Focus on strategic oversight and supply chain management
- Cannot create or modify projects/items
- Cannot manage users or view audit logs

---

## 4. Pricing Specialist

**Email:** `pricing@cscs.com`  
**Password:** `password123`

### Permissions: **Pricing & Item Management**

#### Projects
- ✅ **VIEW_PROJECT** - View projects
- ❌ **CREATE_PROJECT** - Cannot create projects
- ❌ **UPDATE_PROJECT** - Cannot update projects
- ❌ **DELETE_PROJECT** - Cannot delete projects

#### Items
- ✅ **VIEW_ITEM** - View items
- ✅ **UPDATE_ITEM** - Update items (for pricing-related fields)
- ❌ **CREATE_ITEM** - Cannot create items
- ❌ **DELETE_ITEM** - Cannot delete items

#### Workflow
- ❌ **ADVANCE_WORKFLOW** - Cannot advance workflow stages
- ❌ **MOVE_BACK_WORKFLOW** - Cannot move workflow back

#### Pricing
- ✅ **SUBMIT_PRICING** - Submit pricing for approval
- ✅ **VIEW_PRICING** - View pricing information
- ❌ **APPROVE_PRICING** - Cannot approve pricing

#### User Management
- ❌ **MANAGE_USERS** - Cannot manage users
- ❌ **MANAGE_ROLES** - Cannot manage roles
- ❌ **MANAGE_PERMISSIONS** - Cannot manage permissions

#### Audit
- ❌ **VIEW_AUDIT_LOGS** - Cannot view audit logs

### Access Level
- Primary responsibility: Pricing management
- Can view projects and items
- Can update items (especially pricing-related fields)
- Can submit pricing for approval
- Cannot create projects/items or manage users

---

## 5. Logistics

**Email:** `logistics@cscs.com`  
**Password:** `password123`

### Permissions: **Logistics & Freight Management**

#### Projects
- ✅ **VIEW_PROJECT** - View projects
- ❌ **CREATE_PROJECT** - Cannot create projects
- ❌ **UPDATE_PROJECT** - Cannot update projects
- ❌ **DELETE_PROJECT** - Cannot delete projects

#### Items
- ✅ **VIEW_ITEM** - View items
- ✅ **UPDATE_ITEM** - Update items (for logistics-related fields like freight brackets)
- ❌ **CREATE_ITEM** - Cannot create items
- ❌ **DELETE_ITEM** - Cannot delete items

#### Workflow
- ❌ **ADVANCE_WORKFLOW** - Cannot advance workflow stages
- ❌ **MOVE_BACK_WORKFLOW** - Cannot move workflow back

#### Pricing
- ✅ **VIEW_PRICING** - View pricing information
- ❌ **APPROVE_PRICING** - Cannot approve pricing
- ❌ **SUBMIT_PRICING** - Cannot submit pricing

#### User Management
- ❌ **MANAGE_USERS** - Cannot manage users
- ❌ **MANAGE_ROLES** - Cannot manage roles
- ❌ **MANAGE_PERMISSIONS** - Cannot manage permissions

#### Audit
- ❌ **VIEW_AUDIT_LOGS** - Cannot view audit logs

### Access Level
- Primary responsibility: Logistics and freight management
- Can view projects and items
- Can update items (especially logistics-related fields like freight brackets, shipping info)
- Can view pricing information
- Cannot create projects/items or manage users

---

## 6. Supplier

**Email:** `supplier@cscs.com`  
**Password:** `password123`

### Permissions: **Supplier Operations**

#### Projects
- ✅ **VIEW_OWN_PROJECTS** - View projects assigned to supplier
- ❌ **CREATE_PROJECT** - Cannot create projects
- ❌ **UPDATE_PROJECT** - Cannot update projects
- ❌ **DELETE_PROJECT** - Cannot delete projects
- ❌ **VIEW_ALL_PROJECTS** - Cannot view all projects

#### Items
- ✅ **VIEW_ITEM** - View items
- ❌ **CREATE_ITEM** - Cannot create items
- ❌ **UPDATE_ITEM** - Cannot update items
- ❌ **DELETE_ITEM** - Cannot delete items

#### Workflow
- ✅ **SUBMIT_SUPPLIER_PRICING** - Submit supplier pricing
- ❌ **ADVANCE_WORKFLOW** - Cannot advance workflow stages
- ❌ **MOVE_BACK_WORKFLOW** - Cannot move workflow back

#### Pricing
- ❌ **APPROVE_PRICING** - Cannot approve pricing
- ❌ **SUBMIT_PRICING** - Cannot submit KINEXO pricing
- ❌ **VIEW_PRICING** - Cannot view pricing (may be restricted)

#### Dashboard
- ✅ **VIEW_DASHBOARD** - Access main dashboard
- ❌ **VIEW_ANALYTICS** - Cannot view analytics

### Access Level
- Primary responsibility: Submit supplier pricing and item specifications
- Can view own assigned projects
- Can view items
- Can submit supplier pricing
- Limited access to system features

---

## 7. DC Operator

**Email:** `dcoperator@cscs.com`  
**Password:** `password123`

### Permissions: **Distribution Center Operations**

#### Projects
- ✅ **VIEW_OWN_PROJECTS** - View projects assigned to DC
- ❌ **CREATE_PROJECT** - Cannot create projects
- ❌ **UPDATE_PROJECT** - Cannot update projects
- ❌ **DELETE_PROJECT** - Cannot delete projects
- ❌ **VIEW_ALL_PROJECTS** - Cannot view all projects

#### Items
- ✅ **VIEW_ITEM** - View items
- ❌ **CREATE_ITEM** - Cannot create items
- ❌ **UPDATE_ITEM** - Cannot update items
- ❌ **DELETE_ITEM** - Cannot delete items

#### Workflow
- ✅ **COMPLETE_DC_SETUP** - Complete DC transition setup and advance project
- ❌ **ADVANCE_WORKFLOW** - Cannot advance workflow stages (except DC setup)
- ❌ **MOVE_BACK_WORKFLOW** - Cannot move workflow back

#### Distribution
- ✅ **VIEW_DCS** - View distribution centers
- ❌ **MANAGE_DCS** - Cannot manage distribution centers

#### Dashboard
- ✅ **VIEW_DASHBOARD** - Access main dashboard
- ❌ **VIEW_ANALYTICS** - Cannot view analytics

### Access Level
- Primary responsibility: Distribution center operations and DC setup
- Can view own assigned projects
- Can view items
- Can complete DC setup tasks
- Can view distribution centers
- Limited access to system features

---

## Permission Categories

### Available Permissions in the System

#### Projects Category
- `CREATE_PROJECT` - Create new projects
- `UPDATE_PROJECT` - Update projects
- `DELETE_PROJECT` - Delete projects
- `VIEW_PROJECT` - View projects

#### Items Category
- `CREATE_ITEM` - Create items
- `UPDATE_ITEM` - Update items
- `DELETE_ITEM` - Delete items
- `VIEW_ITEM` - View items

#### Workflow Category
- `ADVANCE_WORKFLOW` - Advance workflow stages
- `MOVE_BACK_WORKFLOW` - Move workflow back

#### Pricing Category
- `APPROVE_PRICING` - Approve pricing
- `SUBMIT_PRICING` - Submit pricing
- `VIEW_PRICING` - View pricing

#### Users Category
- `MANAGE_USERS` - Manage users
- `MANAGE_ROLES` - Manage roles
- `MANAGE_PERMISSIONS` - Manage permissions

#### Audit Category
- `EXPORT_DATA` - Export system data
- `VIEW_AUDIT_LOGS` - View audit trail

#### Dashboard Category
- `VIEW_ANALYTICS` - Access analytics and reports
- `VIEW_DASHBOARD` - Access main dashboard

#### Distribution Category
- `MANAGE_DCS` - Create/edit distribution centers
- `VIEW_DCS` - View distribution centers

#### System Category
- `MANAGE_SETTINGS` - Edit system settings
- `VIEW_SETTINGS` - View system settings

#### Workflow Category (Extended)
- `APPROVE_AS_CM` - Approve as Category Manager
- `APPROVE_AS_SSM` - Approve as Strategic Supply Manager
- `COMPLETE_DC_SETUP` - Complete DC transition setup
- `REJECT_PROJECTS` - Reject project submissions
- `SUBMIT_FOR_REVIEW` - Submit projects for review
- `SUBMIT_FREIGHT_STRATEGY` - Submit freight strategy data
- `SUBMIT_KINEXO_PRICING` - Submit internal pricing
- `SUBMIT_SUPPLIER_PRICING` - Submit supplier pricing
- `VIEW_FREIGHT_STRATEGY` - View freight strategy data and brackets

#### Projects Category (Extended)
- `UPDATE_ALL_PROJECTS` - Edit any project
- `UPDATE_OWN_PROJECTS` - Edit own projects
- `VIEW_ALL_PROJECTS` - View all projects in system
- `VIEW_OWN_PROJECTS` - View projects assigned to user

#### Users Category (Extended)
- `CREATE_USERS` - Create new users
- `VIEW_USERS` - View user list

---

## How to Manage Permissions

1. **Login as Admin** (`admin@cscs.com`)
2. Navigate to **Role Management** page
3. Select a role from the list
4. Use the **Permission Matrix** to grant/revoke permissions
5. Click **Save** to update role permissions

---

## Testing Authorization

### Recommended Testing Flow

1. **Start with Admin:**
   - Verify full access to all features
   - Test role management functionality
   - Create test projects and items

2. **Test Category Manager:**
   - Verify project/item creation and management
   - Test workflow advancement
   - Verify restrictions on user management

3. **Test Other Roles:**
   - Login and verify restricted access
   - Use Admin to assign appropriate permissions
   - Re-test with updated permissions

### Expected Behavior

- **Protected Routes:** Users without required permissions will see error messages or be redirected
- **UI Elements:** Buttons and actions will be hidden/disabled based on permissions
- **API Calls:** Backend middleware will reject unauthorized requests with 403 Forbidden

---

## Notes

- **Admin Role:** Always has all permissions regardless of explicit assignments
- **Permission Checking:** Both frontend (UI) and backend (API) enforce permissions
- **Default State:** Roles without assigned permissions have no access to protected operations
- **Dynamic Updates:** Permissions can be updated in real-time through the Role Management interface

