# BambooHR MCP

A Model Context Protocol (MCP) library for BambooHR, built with Node.js and TypeScript. This library provides a clean, type-safe interface to interact with the BambooHR API from your Node.js or TypeScript applications.

## Features

- TypeScript types for all models and API responses
- Simple, promise-based API for all major BambooHR endpoints
- Easy to extend and integrate into your own projects

## Installation

```sh
npm install bamboohr-mcp
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

**Optional:**

- `BAMBOOHR_EMPLOYEE_ID` — Your BambooHR employee ID
- `BAMBOOHR_PROJECT_ID` — Default project ID for time tracking
- `BAMBOOHR_TASK_ID` — Default task ID for time tracking

**Example .env file:**

```env
BAMBOOHR_TOKEN=your_api_token_here
BAMBOOHR_COMPANY_DOMAIN=yourcompany
BAMBOOHR_EMPLOYEE_ID=123
BAMBOOHR_PROJECT_ID=456
BAMBOOHR_TASK_ID=789
```

## Extending

Add new methods in `src/apis/bamboohr.ts` and export them from `src/index.ts`.

## Contributors

- Encore Shao ([github.com/encoreshao](https://github.com/encoreshao))

## License

MIT License

Copyright (c) 2024 Encore Shao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
