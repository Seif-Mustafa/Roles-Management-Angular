Roles Management APIThis document provides comprehensive documentation for the Roles Management backend API, based on the provided Spring Boot Postman collection. It includes TypeScript data contracts essential for building type-safe Angular services.🚀 Getting StartedThis API uses JSON over HTTP and requires a Bearer Token for most authenticated endpoints.VariableDescriptionExample{{baseUrl}}The root URL of the API.http://localhost:8080/api/{{token}}Authorization Bearer Token (obtained via /auth/login).Bearer eyJhbGciOiJIUzI1NiI...1. 📝 Data Contracts (TypeScript Interfaces)Define these interfaces in your Angular application (e.g., in a shared/models/api.model.ts file) for strong typing.1.1 Core Entities// Base Entity for Audit Fields
export interface AuditableEntity {
    createdBy?: number | null;
    createdOn?: string | null;
    modifiedBy?: number | null;
    modifiedOn?: string | null;
    actionBy: number; // Required for CUD (Create/Update/Delete) operations
}

// User Entity
export interface User extends AuditableEntity {
    userId: number;
    appUsername: string;
    email: string;
    // 'Y' for active, 'N' for inactive
    isActive: 'Y' | 'N'; 
    appPassword?: string; // Used only for specific operations like password change
}

// Role Entity
export interface Role extends AuditableEntity {
    roleId: number;
    roleName: string;
    description: string;
}

// Used for complex assignment/edit forms (custom interface based on the endpoint)
export interface AssignableEntity {
    pageId?: number; 
    buttonId?: number; 
    roleId?: number; 
    userId?: number; 
    isSelected: 'Y' | 'N';
}
1.2 Generic Response and PaginationThis structure is used for all API communication.// Spring Data JPA Page Content Structure
export interface SpringPage<T> {
    content: T[]; 
    page: { 
        size: number; 
        number: number;
        totalElements: number; // Total number of records available
        totalPages: number;
    };
}

// Generic API Response Wrapper
export interface GenericResponse<T> {
    success: boolean;
    message: string;
    timestamp: string;
    data: T; // The actual data payload (e.g., User, Role, SpringPage<User>)
    status: number;
    path: string;
}
2. 🔑 Authentication Endpoints (/auth)These endpoints manage user login and credential recovery.MethodEndpointDescriptionRequest Body (Example)Response Body (Data Type)POST{{baseUrl}}auth/loginAuthenticate and obtain an authorization token.{ "username": "...", "password": "..." }GenericResponse<{ token: string }>POST{{baseUrl}}auth/forget-passwordInitiate the password reset workflow.{ "username": "...", "email": "..." }GenericResponse<any>3. 👤 User Management Endpoints (/user)Endpoints for CRUD operations on User entities.MethodEndpointDescriptionRequest Body (Example)Response Body (Data Type)GET{{baseUrl}}user/paginationList Users (Paginated/Sorted).NoneGenericResponse<SpringPage<User>>GET{{baseUrl}}user/pagination-filterList Users with Global Search.NoneGenericResponse<SpringPage<User>>GET{{baseUrl}}user/{id}Retrieve a single User by ID.NoneGenericResponse<User>POST{{baseUrl}}userCreate a new User.{ "appUsername": "...", "email": "...", "isActive": "Y", "actionBy": 1 }GenericResponse<User>PUT{{baseUrl}}user/{id}Update basic User details.{ "appUsername": "...", "email": "...", "isActive": "Y", "actionBy": 1 }GenericResponse<User>DELETE{{baseUrl}}user/{id}Delete a User.NoneGenericResponse<any>PUT{{baseUrl}}user/{id}/change-passwordChange a User's password.{ "oldPassword": "...", "newPassword": "..." }GenericResponse<any>GET{{baseUrl}}user/user-details/{id}Get user details and assigned roles for editing.NoneGenericResponse<UserDetailModel>PUT{{baseUrl}}user/user-details/{id}Update User details and role assignments.Complex JSON PayloadGenericResponse<any>GET{{baseUrl}}user/{id}/rolesGet all roles assigned to a specific user.NoneGenericResponse<Role[]>Pagination Query Parameters:ParameterTypeRequiredDescriptionExamplepagenumberYesThe page index (0-based).?page=0sizenumberYesRecords per page.&size=5sortstringNoField and optional direction.&sort=email,descfilterstringNoGlobal search string (for /pagination-filter).&filter=test4. 👑 Role Management Endpoints (/roles)Endpoints for CRUD operations on Role entities.MethodEndpointDescriptionRequest Body (Example)Response Body (Data Type)GET{{baseUrl}}roles/paginationList Roles (Paginated/Sorted).NoneGenericResponse<SpringPage<Role>>GET{{baseUrl}}roles/pagination-filterList Roles with Global Search.NoneGenericResponse<SpringPage<Role>>GET{{baseUrl}}roles/{id}Retrieve a single Role by ID.NoneGenericResponse<Role>POST{{baseUrl}}rolesCreate a new Role.{ "roleName": "...", "description": "...", "actionBy": 1 }GenericResponse<Role>PUT{{baseUrl}}roles/{id}Update an existing Role.{ "roleName": "...", "description": "...", "actionBy": 1 }GenericResponse<Role>DELETE{{baseUrl}}roles/{id}Delete a Role.NoneGenericResponse<any>GET{{baseUrl}}roles/role-details/{id}Get role details and assigned pages/buttons for editing.NoneGenericResponse<RoleDetailModel>PUT{{baseUrl}}roles/role-details/{id}Update Role details and page/button assignments.Complex JSON PayloadGenericResponse<any>GET{{baseUrl}}roles/{id}/usersGet all users assigned to a specific role.NoneGenericResponse<User[]>5. 🤝 Relationship Management EndpointsEndpoints for managing many-to-many associations.5.1 User-Role Association (/user-role)MethodEndpointDescriptionRequest Body (Example)POST{{baseUrl}}user-roleAssign a Role to a User.{ "userId": 1, "roleId": 4, "actionBy": 1 }DELETE{{baseUrl}}user-roleUnassign a Role from a User.{ "userId": 1, "roleId": 4 }5.2 Page-Role Association (/page-role)MethodEndpointDescriptionRequest Body (Example)POST{{baseUrl}}page-roleAssign a Page to a Role.{ "roleId": 2, "pageId": 6, "actionBy": 1 }DELETE{{baseUrl}}page-roleUnassign a Page from a Role.{ "roleId": 2, "pageId": 3 }5.3 Button-Role Association (/button-role)MethodEndpointDescriptionRequest Body (Example)POST{{baseUrl}}button-roleAssign a Button to a Role.{ "roleId": 1, "buttonId": 1, "actionBy": 1 }DELETE{{baseUrl}}button-roleUnassign a Button from a Role.{ "roleId": 1, "buttonId": 1 }