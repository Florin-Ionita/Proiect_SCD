export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

export interface Preferences {
  desiredRole?: string;
  locations?: string[];
  jobType?: string;
  minSalary?: number;
}

export interface UserProfile {
  id: string; // Mongo ID
  keycloakId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  preferences?: Preferences;
  jobs?: any[]; // Applied jobs
}
