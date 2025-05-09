# BambooHR MCP

A Model Context Protocol (MCP) library for BambooHR, built with Node.js and TypeScript. This library provides a clean, type-safe interface to interact with the BambooHR API from your Node.js or TypeScript applications.

## Features

- TypeScript types for all models and API responses
- Simple, promise-based API for all major BambooHR endpoints
- Easy to extend and integrate into your own projects

## Installation

```sh
# Clone the repository
git clone https://github.com/encoreshao/bamboohr-mcp.git

# Navigate to the project directory
cd bamboohr-mcp

# Install dependencies
npm install
```

## Usage

```ts
import {
  BambooHRApi,
  fetchWhosOut,
  fetchProjects,
  submitWorkHours,
  getMe,
  fetchEmployeeDirectory,
  fetchTimeEntries,
} from "bamboohr-mcp";

const token = process.env.BAMBOOHR_TOKEN!;
const companyDomain = process.env.BAMBOOHR_COMPANY_DOMAIN!;
const employeeID = process.env.BAMBOOHR_EMPLOYEE_ID!;

// List all employees with name, email, and job title
const directory = await fetchEmployeeDirectory(token, companyDomain);
directory.employees.forEach((emp) => {
  console.log(`${emp.displayName} — ${emp.workEmail} — ${emp.jobTitle}`);
});

// Fetch "who's out today"
const whosOut = await fetchWhosOut(token, companyDomain);
whosOut.forEach((out) => {
  console.log(`${out.employeeName}: ${out.startDate} to ${out.endDate}`);
});

// Submit work hours (find project/task IDs first)
const projects = await fetchProjects(token, companyDomain, employeeID);
const bambooHR = projects.find((p) => p.name.includes("BambooHR"));
const devTask = bambooHR?.tasks.find((t) => t.name.includes("Development"));
if (bambooHR && devTask) {
  await submitWorkHours(
    token,
    companyDomain,
    employeeID,
    bambooHR.id,
    devTask.id,
    "2024-06-01",
    1,
    "Development work on BambooHR"
  );
}
```

## API

All methods return Promises and use the types defined in `src/utils/models.d.ts`.

- `BambooHRApi` class: Encapsulates all API methods.
- Helper functions: `fetchWhosOut`, `fetchProjects`, `submitWorkHours`, `getMe`, `fetchEmployeeDirectory`, `fetchTimeEntries`.

## Environment Variables

You can pass your BambooHR API token and company domain directly to the methods, or use environment variables:

**Required:**

- `BAMBOOHR_TOKEN` — Your BambooHR API token
- `BAMBOOHR_COMPANY_DOMAIN` — Your BambooHR company domain (the part before .bamboohr.com)
- `BAMBOOHR_EMPLOYEE_ID` — Your BambooHR employee ID

### Creating a BambooHR API Token

To use this library, you'll need to create a BambooHR API token:

1. Log in to your BambooHR account
2. Click on your profile picture in the bottom-left corner
3. Select "API Keys" from the dropdown menu
4. Click "Add New Key"
5. Enter a API Key Name for your key (e.g., "MCP Server"), and click "Generate Key"
6. Copy the generated token immediately (it will only be shown once)

### Finding Your Company Domain

Your company domain is the subdomain used in your BambooHR URL:

- If you access BambooHR at `https://yourcompany.bamboohr.com`, then your company domain is `yourcompany`
- This value should be used for the `BAMBOOHR_COMPANY_DOMAIN` environment variable or passed directly to the API methods

### Getting Your Employee ID

You can find your employee ID in several ways:

1. From your profile URL: When viewing your profile, the URL will contain your employee ID (e.g., `https://yourcompany.bamboohr.com/employees/employee.php?id=123`)

**Example .env file:**

```env
BAMBOOHR_TOKEN=your_api_token_here
BAMBOOHR_COMPANY_DOMAIN=yourcompany
BAMBOOHR_EMPLOYEE_ID=123
```

## Extending

Add new methods in `src/apis/bamboohr.ts` and export them from `src/index.ts`.

## Contributors

- Encore Shao ([github.com/encoreshao](https://github.com/encoreshao))

## License

This project is licensed under the MIT License. See the LICENSE file for details.
