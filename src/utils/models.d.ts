export interface IProject {
  name: string;
  id: string;
  tasks: { name: string; id: string }[];
}

export interface IOutItems {
  requestId?: string;
  outType: string;
  employeeId: string;
  employeeName: string;
  holidayId?: string;
  holidayName?: string;
  startDate: string;
  endDate: string;
}

export interface IEmployee {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  location: string;
}

export interface IWorkedTime {
  project: string | undefined;
  hours: number | undefined;
  note: string | undefined;
  projectId: number | undefined;
  date: string | undefined;
  taskId: number | undefined;
}

export interface ITimeEntry {
  id: number;
  employeeId: number;
  type: string;
  date: string;
  start: string | null;
  end: string | null;
  timezone: string;
  hours: number;
  note: string;
  projectInfo?: {
    project: {
      id: number;
      name: string;
    };
    task: {
      id: number;
      name: string;
    };
  };
  approvedAt: string | null;
  approved: boolean;
}

export interface ITimeOffRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface IDirectoryField {
  id: string;
  name: string;
  type: string;
}

export interface IDirectoryEmployee {
  id: number;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  jobTitle?: string;
  workEmail?: string;
  department?: string;
  location?: string;
  division?: string;
  pronouns?: string;
  supervisor?: string;
  workPhone?: string;
  photoUrl?: string;
  canUploadPhoto?: string;
  workPhoneExtension?: string | null;
  skypeUsername?: string;
  facebook?: string;
  [key: string]: string | number | null | undefined; // For any additional fields
}
