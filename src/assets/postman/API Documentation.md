# **📘 Roles Management API Documentation**

A clean, structured API reference based on the provided Postman collection.

---

# **🔐 Authentication**

## **POST /auth/login**

Authenticate and obtain a JWT token.

### **Request Body**

```json
{
  "username": "seifadmin",
  "password": "pass123"
}
```

### **Response**

Returns a JWT token inside `data.token`.

---

## **POST /auth/forget-password**

Initiates password recovery.

### **Request Body**

```json
{
  "username": "seifadmin",
  "email": "test@example.com"
}
```

---

---

# **👤 User Endpoints**

---

## **POST /user**

Create a new user.

### **Headers**

```
Authorization: {{token}}
```

### **Request Body**

```json
{
  "appUsername": "TEST USER",
  "email": "testuser@gmail.com",
  "isActive": "Y",
  "actionBy": 1
}
```

---

## **PUT /user/{id}**

Update a user.

### **Request Body**

```json
{
  "appUsername": "seifadmin",
  "email": "seif.mostafa.projects@gmail.com",
  "isActive": "Y",
  "actionBy": 1
}
```

---

## **DELETE /user/{id}**

Delete a user.

### **Headers**

```
Authorization: {{token}}
```

---

## **GET /user/{id}**

Get user by ID.

---

## **GET /user**

List all users.

---

## **GET /user/active**

Return all active users.

---

## **GET /user/in-active**

Return inactive users.

---

## **GET /user/{id}/roles**

Get roles assigned to a specific user.

---

## **GET /user/{id}/pages**

Get pages assigned to a user.

---

## **GET /user/{id}/buttons**

Get buttons assigned to a user.

---

## **PUT /user/{id}/change-password**

Change user password.

### **Request Body**

```json
{
  "oldPassword": "F4yx&@5V",
  "newPassword": "dev1234"
}
```

---

## **GET /user/user-details/{id}**

Get full user details (info + roles).

---

## **PUT /user/user-details/{id}**

Update user + role assignments.

### **Request Body**

```json
{
  "userId": 11,
  "username": "onemore",
  "email": "onemore@gmail.com",
  "isActive": "N",
  "modifiedBy": 1,
  "roles": [
    { "roleId": 1, "isSelected": "Y" },
    { "roleId": 2, "isSelected": "Y" },
    { "roleId": 3, "isSelected": "N" },
    { "roleId": 5, "isSelected": "N" }
  ]
}
```

---

## **GET /user/pagination**

Paginated users.

### **Query Parameters**

```
page=0
size=5
sort=userId
```

---

## **GET /user/pagination-filter**

Paginated + filtered users.

### **Query Parameters**

```
page=0
size=5
sort=userId
filter=hash
```

---

---

# **👑 Role Endpoints**

---

## **POST /roles**

Create a new role.

### **Request Body**

```json
{
  "roleName": "First Role",
  "description": "Dummy description",
  "actionBy": 1
}
```

---

## **PUT /roles/{id}**

Update a role.

### **Request Body**

```json
{
  "roleName": "Second Role",
  "description": "Second Role Description",
  "actionBy": 1
}
```

---

## **DELETE /roles/{id}**

Delete a role.

---

## **GET /roles/{id}**

Get role by ID.

---

## **GET /roles**

List all roles.

---

## **GET /roles/{id}/users**

Get users assigned to a role.

---

## **GET /roles/{id}/pages**

Get pages assigned to a role.

---

## **GET /roles/{id}/buttons**

Get buttons assigned to a role.

---

## **GET /roles/role-details/{id}**

Get role details including pages & buttons.

---

## **PUT /roles/role-details/{id}**

Update role details + pages + buttons.

### **Request Body (Full Example)**

This contains all pages and buttons with `isSelected: "Y"/"N"`:

```json
{
  "roleId": 1,
  "roleName": "Admin (Edited)",
  "roleDescription": "This role contains all pages",
  "isActive": "Y",
  "pages": [
    { "pageId": 7, "isSelected": "Y" },
    { "pageId": 8, "isSelected": "Y" }
  ],
  "buttons": [
    { "buttonId": 1, "isSelected": "Y" },
    { "buttonId": 2, "isSelected": "Y" }
  ]
}
```

---

## **GET /roles/pagination**

Paginated roles.

### **Query Parameters**

```
page=1
size=2
sort=roleId
```

---

## **GET /roles/pagination-filter**

Paginated + filtered roles.

### **Query Parameters**

```
page=0
size=5
sort=roleName,desc
filter=<optional>
```

---

---

# **🤝 User–Role Endpoints**

---

## **POST /user-role**

Assign a role to a user.

### **Request Body**

```json
{
  "userId": 1,
  "roleId": 4,
  "actionBy": 1
}
```

---

## **DELETE /user-role**

Unassign a role from a user.

### **Request Body**

```json
{
  "userId": 1,
  "roleId": 4
}
```

---

---

# **🗂 Page–Role Endpoints**

---

## **POST /page-role**

Assign a page to a role.

### **Request Body**

```json
{
  "roleId": 2,
  "pageId": 6,
  "actionBy": 1
}
```

---

## **DELETE /page-role**

Remove page from role.

### **Request Body**

```json
{
  "roleId": 2,
  "pageId": 3
}
```

---

---

# **🔘 Button–Role Endpoints**

---

## **POST /button-role**

Assign a button to a role.

### **Request Body**

```json
{
  "roleId": 1,
  "buttonId": 1,
  "actionBy": 1
}
```

---

## **DELETE /button-role**

Unassign button from role.

### **Request Body**

```json
{
  "buttonId": 1,
  "roleId": 1
}
```


