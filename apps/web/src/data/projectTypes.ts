export interface ProjectTeamMember {
  userId: string;
  role: string;
}

export interface ProjectPosition {
  id: string;
  title: string;
  description: string | null;
  expectedHours: number | null;
  isOpen: boolean;
  skills: Array<{ id: string; name: string }>;
}

export interface ProjectDetail {
  id: string;
  title: string;
  pitch: string;
  status: string;
  sectorId: string | null;
  regionId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectTeamMember[];
  positions: ProjectPosition[];
}
