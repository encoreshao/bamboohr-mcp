import type {
  IDirectoryEmployee,
  IEmployee,
  IProject,
  ITimeEntry,
  ITimeOffRequest,
} from "../utils/models";
import { getBamboohrConfig } from "./bamboohrConfig";
import { XMLParser } from "fast-xml-parser";

/**
 * BambooHR API error class for handling specific API errors
 */
class BambooHRApiError extends Error {
  status: number;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.name = "BambooHRApiError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * Types for BambooHR API requests and responses
 */
interface WorkHoursEntry {
  employeeId: number;
  date: string;
  hours: number;
  note?: string;
  projectId: number;
  taskId: number;
}

/**
 * Make an API request to BambooHR
 * @param endpoint - The API endpoint to call
 * @param method - The HTTP method to use
 * @param body - Optional request body
 * @returns The API response
 */
async function request<T>(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { token } = getBamboohrConfig();
  const credentials = btoa(`${token}:x`);
  const headers: HeadersInit = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(
      `https://api.bamboohr.com/api/gateway.php/${endpoint}`,
      {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    if (!response.ok) {
      throw new BambooHRApiError(
        `API request failed with status ${response.status}`,
        response.status,
        endpoint
      );
    }

    // Determine response type based on Content-Type header
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    } else if (
      contentType.includes("text/xml") ||
      contentType.includes("application/xml")
    ) {
      return response.text() as unknown as Promise<T>;
    } else {
      return response.text() as unknown as Promise<T>;
    }
  } catch (error) {
    if (error instanceof BambooHRApiError) {
      throw error;
    }
    throw new BambooHRApiError(
      `Failed to fetch ${endpoint}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      0,
      endpoint
    );
  }
}

/**
 * Parses XML string into a JavaScript object
 * @param xmlString - The XML string to parse
 * @returns Parsed JavaScript object
 */
export function parseXML(xmlString: string): any {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseAttributeValue: true,
    trimValues: true,
  });
  return parser.parse(xmlString);
}

/**
 * Parse XML response to extract time off requests
 * @param xmlString - The XML string to parse
 * @returns Array of time off requests
 */
function parseTimeOffXML(xmlString: string): ITimeOffRequest[] {
  const jsonObj = parseXML(xmlString);

  const timeOffRequests: ITimeOffRequest[] = [];
  jsonObj.calendar.item.forEach((item: any) => {
    const requestId = item["request"]["@_id"];
    const employeeName = item["employee"]["#text"];
    const startDate = item["start"];
    const endDate = item["end"];
    const employeeId = item["employee"]["@_id"];
    const type = item["@_type"];

    timeOffRequests.push({
      requestId,
      employeeId,
      employeeName,
      startDate,
      endDate,
      type,
    });
  });

  return timeOffRequests;
}

/**
 * Parse XML response to extract employee directory data
 * @param xmlString - The XML string to parse
 * @returns Employee directory data
 */
function parseDirectoryXML(xmlString: string): IDirectoryEmployee[] {
  const jsonObj = parseXML(xmlString);

  const employeeDirectories: IDirectoryEmployee[] = [];
  jsonObj.directory.employees.employee.forEach((employee: any) => {
    const employeeId = employee["@_id"];

    const employeeData: any = {
      id: employeeId,
    };

    // Process each field and add it to the employee data
    employee.field.forEach((field: any) => {
      if (field["@_id"] && field["#text"] !== undefined) {
        employeeData[field["@_id"]] = field["#text"];
      }
    });

    employeeDirectories.push(employeeData);
  });

  return employeeDirectories;
}

/**
 * Parse XML response to extract employee data
 * @param xmlString - The XML string to parse
 * @returns Employee data
 */
function parseEmployeeXML(xmlString: string): IEmployee {
  const jsonObj = parseXML(xmlString);

  // Based on the sample XML, the employee node is directly at the root level
  // not inside a response object
  const employee = jsonObj.employee;
  if (!employee) {
    throw new Error("Employee node not found in XML response");
  }

  const fields = jsonObj.employee.field;
  const fieldIds = fields.map((field: any) => field["@_id"]);
  const employeeData: Record<string, string> = {};
  (Array.isArray(fieldIds) ? fieldIds : [fieldIds]).forEach((fieldId: any) => {
    const field = fields.find((field: any) => field["@_id"] === fieldId);
    if (field) {
      employeeData[fieldId] = field["#text"]?.trim() || "";
    }
  });

  // Extract required fields for IEmployee interface
  const firstName = employeeData["firstName"] || "";
  const lastName = employeeData["lastName"] || "";
  const jobTitle = employeeData["jobTitle"] || "";
  const department = employeeData["department"] || "";
  const location = employeeData["location"] || "";

  return {
    id: Number(employee["@_id"]),
    firstName,
    lastName,
    jobTitle,
    department,
    location,
    ...employeeData,
  };
}

/**
 * Get a list of employees who are out of office
 * @returns Array of time off requests
 */
export async function getWhosOut(): Promise<ITimeOffRequest[]> {
  const { companyDomain } = getBamboohrConfig();
  const xmlText = await request<string>(
    `${companyDomain}/v1/time_off/whos_out`,
    "GET"
  );

  return parseTimeOffXML(xmlText);
}

/**
 * Get projects for an employee
 * @param employeeId - The employee ID
 * @returns Array of projects
 */
export async function getProjects(employeeId?: number): Promise<IProject[]> {
  const { companyDomain } = getBamboohrConfig();
  const resolvedEmployeeId = employeeId ?? getBamboohrConfig().employeeId;
  const projects = await request<IProject[]>(
    `${companyDomain}/v1/time_tracking/employees/${resolvedEmployeeId}/projects`,
    "GET"
  );

  // Ensure each project has a tasks array
  return projects.map((project) => ({
    ...project,
    tasks: project.tasks || [],
  }));
}

export async function fetchTimeEntries(
  employeeId?: number
): Promise<ITimeEntry[]> {
  const { companyDomain } = getBamboohrConfig();
  const resolvedEmployeeId = employeeId ?? getBamboohrConfig().employeeId;
  const today = new Date().toISOString().split("T")[0];
  const timeEntries = await request<ITimeEntry[]>(
    `${companyDomain}/v1/time_tracking/timesheet_entries?employeeIds=${resolvedEmployeeId}&start=${today}&end=${today}`,
    "GET"
  );

  return timeEntries.map((entry) => ({
    ...entry,
  }));
}

/**
 * Get employee data
 * @param employeeId - The employee ID
 * @returns Employee data
 */
export async function getEmployee(
  employeeId?: number
): Promise<IEmployee | any> {
  const { companyDomain } = getBamboohrConfig();
  const resolvedEmployeeId = employeeId ?? getBamboohrConfig().employeeId;
  const xmlText = await request<string>(
    `${companyDomain}/v1/employees/${resolvedEmployeeId}?fields=firstName,lastName,jobTitle,department,location`,
    "GET"
  );
  return parseEmployeeXML(xmlText);
  // return xmlText;
}

/**
 * Get employee directory
 * @param companyDomain - The BambooHR company domain
 * @returns Employee directory data
 */
export async function getEmployeeDirectory(): Promise<IDirectoryEmployee[]> {
  const { companyDomain } = getBamboohrConfig();
  const xmlText = await request<string>(
    `${companyDomain}/v1/employees/directory`,
    "GET"
  );

  return parseDirectoryXML(xmlText);
}

/**
 * Submit work hours
 * @param employeeId - The employee ID
 * @param projectId - The project ID
 * @param taskId - The task ID
 * @param date - The date in YYYY-MM-DD format
 * @param hours - The number of hours worked
 * @param note - Optional note
 * @returns True if submission was successful
 */
export async function submitWorkHours(
  employeeId?: number,
  projectId?: number,
  taskId?: number,
  date?: string,
  hours?: number,
  note?: string
): Promise<boolean> {
  const { companyDomain } = getBamboohrConfig();
  const resolvedEmployeeId = employeeId ?? getBamboohrConfig().employeeId;
  const resolvedProjectId = projectId ?? getBamboohrConfig().projectId;
  const resolvedTaskId = taskId ?? getBamboohrConfig().taskId;
  const resolvedDate = date ?? new Date().toISOString().split("T")[0];
  const resolvedHours = hours ?? 8;

  if (
    resolvedEmployeeId === undefined ||
    resolvedProjectId === undefined ||
    resolvedTaskId === undefined
  ) {
    throw new Error(
      "employeeId, projectId, and taskId are required for submitting work hours. Please set them in config or pass as arguments."
    );
  }

  const entry: WorkHoursEntry = {
    employeeId: resolvedEmployeeId,
    date: resolvedDate,
    hours: resolvedHours,
    projectId: resolvedProjectId,
    taskId: resolvedTaskId,
  };

  if (note) {
    entry.note = note;
  }

  const body = {
    hours: [entry],
  };

  try {
    await request<unknown>(
      `${companyDomain}/v1/time_tracking/hour_entries/store`,
      "POST",
      body
    );
    return true;
  } catch (error) {
    console.error("Failed to submit work hours:", error);
    return false;
  }
}

export { BambooHRApiError };
