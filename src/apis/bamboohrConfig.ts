export interface BamboohrConfig {
  token?: string;
  companyDomain?: string;
  employeeId?: number;
  projectId?: number;
  taskId?: number;
}

const config: BamboohrConfig = {
  token: process.env.BAMBOOHR_TOKEN,
  companyDomain: process.env.BAMBOOHR_COMPANY_DOMAIN,
  employeeId: process.env.BAMBOOHR_EMPLOYEE_ID
    ? Number(process.env.BAMBOOHR_EMPLOYEE_ID)
    : undefined,
  projectId: process.env.BAMBOOHR_PROJECT_ID
    ? Number(process.env.BAMBOOHR_PROJECT_ID)
    : undefined,
  taskId: process.env.BAMBOOHR_TASK_ID
    ? Number(process.env.BAMBOOHR_TASK_ID)
    : undefined,
};

export function setBamboohrConfig(newConfig: Partial<BamboohrConfig>) {
  Object.assign(config, newConfig);
}

export function getBamboohrConfig(): BamboohrConfig {
  return config;
}
