import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  getWhosOut,
  getProjects,
  submitWorkHours,
  getEmployee,
  getEmployeeDirectory,
  fetchTimeEntries,
} from "./apis/bamboohr";
import { getBamboohrConfig } from "./apis/bamboohrConfig";

const server = new McpServer({
  name: "bamboohr-mcp",
  version: "1.0.0",
  description: "BambooHR MCP Server",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const envOr = (val: string | undefined, envName: string) =>
  val ?? process.env[envName];

console.log(
  "BambooHR config companyDomain:",
  getBamboohrConfig().companyDomain
);

server.tool(
  "bamboohr_fetch_whos_out",
  { token: z.string().optional(), companyDomain: z.string().optional() },
  async ({
    token,
    companyDomain,
  }: {
    token?: string;
    companyDomain?: string;
  }) => {
    if (token) require("./apis/bamboohrConfig").setBamboohrConfig({ token });
    if (companyDomain)
      require("./apis/bamboohrConfig").setBamboohrConfig({ companyDomain });
    const result = await getWhosOut();
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "bamboohr_fetch_projects",
  {
    token: z.string().optional(),
    companyDomain: z.string().optional(),
    employeeId: z.number().optional(),
  },
  async ({
    token,
    companyDomain,
    employeeId,
  }: {
    token?: string;
    companyDomain?: string;
    employeeId?: number;
  }) => {
    if (token) require("./apis/bamboohrConfig").setBamboohrConfig({ token });
    if (companyDomain)
      require("./apis/bamboohrConfig").setBamboohrConfig({ companyDomain });
    if (employeeId !== undefined)
      require("./apis/bamboohrConfig").setBamboohrConfig({ employeeId });
    const result = await getProjects(employeeId);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "bamboohr_submit_work_hours",
  {
    token: z.string().optional(),
    companyDomain: z.string().optional(),
    employeeId: z.number().optional(),
    projectId: z.number().optional(),
    taskId: z.number().optional(),
    date: z.string().optional(),
    hours: z.number().optional(),
    note: z.string().optional(),
  },
  async (args: {
    token?: string;
    companyDomain?: string;
    employeeId?: number;
    projectId?: number;
    taskId?: number;
    date?: string;
    hours?: number;
    note?: string;
  }) => {
    if (args.token)
      require("./apis/bamboohrConfig").setBamboohrConfig({ token: args.token });
    if (args.companyDomain)
      require("./apis/bamboohrConfig").setBamboohrConfig({
        companyDomain: args.companyDomain,
      });
    if (args.employeeId !== undefined)
      require("./apis/bamboohrConfig").setBamboohrConfig({
        employeeId: args.employeeId,
      });
    if (args.projectId !== undefined)
      require("./apis/bamboohrConfig").setBamboohrConfig({
        projectId: args.projectId,
      });
    if (args.taskId !== undefined)
      require("./apis/bamboohrConfig").setBamboohrConfig({
        taskId: args.taskId,
      });
    const result = await submitWorkHours(
      args.employeeId,
      args.projectId,
      args.taskId,
      args.date,
      args.hours,
      args.note
    );
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "bamboohr_get_me",
  {
    token: z.string().optional(),
    companyDomain: z.string().optional(),
    employeeId: z.number().optional(),
  },
  async ({
    token,
    companyDomain,
    employeeId,
  }: {
    token?: string;
    companyDomain?: string;
    employeeId?: number;
  }) => {
    if (token) require("./apis/bamboohrConfig").setBamboohrConfig({ token });
    if (companyDomain)
      require("./apis/bamboohrConfig").setBamboohrConfig({ companyDomain });
    if (employeeId !== undefined)
      require("./apis/bamboohrConfig").setBamboohrConfig({ employeeId });
    const result = await getEmployee(employeeId);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "bamboohr_fetch_employee_directory",
  { token: z.string().optional(), companyDomain: z.string().optional() },
  async ({
    token,
    companyDomain,
  }: {
    token?: string;
    companyDomain?: string;
  }) => {
    if (token) require("./apis/bamboohrConfig").setBamboohrConfig({ token });
    if (companyDomain)
      require("./apis/bamboohrConfig").setBamboohrConfig({ companyDomain });
    const result = await getEmployeeDirectory();
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.tool(
  "bamboohr_fetch_time_entries",
  {
    token: z.string().optional(),
    companyDomain: z.string().optional(),
    employeeId: z.number().optional(),
  },
  async ({
    token,
    companyDomain,
    employeeId,
  }: {
    token?: string;
    companyDomain?: string;
    employeeId?: number;
  }) => {
    if (token) require("./apis/bamboohrConfig").setBamboohrConfig({ token });
    if (companyDomain)
      require("./apis/bamboohrConfig").setBamboohrConfig({ companyDomain });
    if (employeeId !== undefined)
      require("./apis/bamboohrConfig").setBamboohrConfig({ employeeId });
    const result = await fetchTimeEntries(employeeId);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BambooHR MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
