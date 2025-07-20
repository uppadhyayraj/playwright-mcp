
---

## 7. Real-World API Examples: Custom Headers & Authentication

### Example 1: Using Custom Headers
**Scenario:** Send a GET request to the [httpbin.org/headers](https://httpbin.org/headers) endpoint with a custom header.

**Prompt:**
```
Call the `api_request` tool to make a GET request to `https://httpbin.org/headers` with custom header `X-Custom-Header: WindsurfTest`.
```
**Payload:**
```
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
```
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
