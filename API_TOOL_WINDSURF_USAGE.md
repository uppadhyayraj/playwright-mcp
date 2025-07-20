---

## Playwright MCP API Tool Usage in Windsurf

This guide shows how to use the API testing tool you added to the Playwright MCP server from Windsurf, with real-world API endpoints and prompt examples for all HTTP methods and advanced validation.

---

## 1. Tool Overview
- **Tool Name:** `api_request`
- **Description:** Perform an HTTP API request (GET, POST, PUT, PATCH, DELETE, etc.) and validate the response.
- **Config Requirement:** `"api_request"` must be present in your MCP config `capabilities`.

---

## 2. General Prompt Pattern

> **Prompt:**
> "Call the `api_request` tool to make a [METHOD] request to `[URL]` with [optional headers/data]."

You can specify method, headers, data, and expected status/content-type/body.

---

## 3. Basic Example Prompts and Payloads

### A. GET Request (Public API)
**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://jsonplaceholder.typicode.com/posts/1`.
```
**Payload:**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts/1"
}
```

### B. POST Request (JSON)
**Prompt:**
```
Call the `api_request` tool to make a POST request to `https://jsonplaceholder.typicode.com/posts` with JSON body `{ "title": "foo", "body": "bar", "userId": 1 }`.
```
**Payload:**
```json
{
  "method": "POST",
  "url": "https://jsonplaceholder.typicode.com/posts",
  "headers": { "Content-Type": "application/json" },
  "data": { "title": "foo", "body": "bar", "userId": 1 }
}
```

### C. PUT Request
**Prompt:**
```
Call the `api_request` tool to make a PUT request to `https://jsonplaceholder.typicode.com/posts/1` with JSON body `{ "id": 1, "title": "updated", "body": "baz", "userId": 1 }`.
```
**Payload:**
```json
{
  "method": "PUT",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "headers": { "Content-Type": "application/json" },
  "data": { "id": 1, "title": "updated", "body": "baz", "userId": 1 }
}
```

### D. PATCH Request
**Prompt:**
```
Call the `api_request` tool to make a PATCH request to `https://jsonplaceholder.typicode.com/posts/1` with JSON `{ "title": "patched" }`.
```
**Payload:**
```json
{
  "method": "PATCH",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "headers": { "Content-Type": "application/json" },
  "data": { "title": "patched" }
}
```

### E. DELETE Request
**Prompt:**
```
Call the `api_request` tool to make a DELETE request to `https://jsonplaceholder.typicode.com/posts/1`.
```
**Payload:**
```json
{
  "method": "DELETE",
  "url": "https://jsonplaceholder.typicode.com/posts/1"
}
```

---

## 4. Advanced: Adding Expectations
You can add `expect` for status, content-type, and advanced body validation:
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "expect": {
    "status": 200,
    "contentType": "application/json"
  }
}
```

---

## 5. Response Body Validation: Tested Windsurf Scenarios

### A. Partial/Exact JSON Body Match
**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://jsonplaceholder.typicode.com/posts/1` and validate that the response contains `"userId": 1` and `"id": 1`.
```
**Payload:**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "expect": {
    "body": { "userId": 1, "id": 1 }
  }
}
```

### B. Regex Body Match
**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://jsonplaceholder.typicode.com/posts/1` and check if the response contains the word `"sunt"`.
```
**Payload:**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "expect": {
    "bodyRegex": "sunt"
  }
}
```

### C. Failing Case Example
**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://jsonplaceholder.typicode.com/posts/1` and validate that the response contains `"userId": 999`.
```
**Payload:**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "expect": {
    "body": { "userId": 999 }
  }
}
```
**Expected:**
- The validation should fail, and the output will include a `bodyValidation` object with `matched: false` and a reason.

---

## 6. Real-World API Examples: Custom Headers & Authentication

### Example 1: Using Custom Headers
**Scenario:** Send a GET request to the [httpbin.org/headers](https://httpbin.org/headers) endpoint with a custom header.

**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://httpbin.org/headers` with custom header `X-Custom-Header: WindsurfTest`.
```
**Payload:**
```json
{
  "method": "GET",
  "url": "https://httpbin.org/headers",
  "headers": {
    "X-Custom-Header": "WindsurfTest"
  }
}
```
- **What to expect:** The response will echo your custom header in the response body.

---

### Example 2: Authentication (Bearer Token)
**Scenario:** Access a protected endpoint using Bearer token authentication. We'll use [reqres.in](https://reqres.in/) which simulates a real login and protected resource.

**Step 1: Obtain a Token**

**Prompt:**
```
Call the `api_request` tool to make a POST request to `https://reqres.in/api/login` with JSON `{ "email": "eve.holt@reqres.in", "password": "cityslicka" }`.
```
**Payload:**
```json
{
  "method": "POST",
  "url": "https://reqres.in/api/login",
  "headers": { "Content-Type": "application/json" },
  "data": {
    "email": "eve.holt@reqres.in",
    "password": "cityslicka"
  }
}
```
- **The response will include a `token`.**

**Step 2: Use the Token in an Authenticated Request**

**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://reqres.in/api/users/2` with Bearer token authentication.
```
**Payload:**
```
{
  "method": "GET",
  "url": "https://reqres.in/api/users/2",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
}
```
- **Replace `YOUR_TOKEN_HERE` with the token received from the login step.**

---

These examples can be copied directly into Windsurf prompts or used as templates for your own API testing scenarios.
