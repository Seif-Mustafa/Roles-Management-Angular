export type ActiveFlag = 'Y' | 'N' | boolean;

export interface OrgDataTable {
  orgId: number;                  // synthetic key for table actions
  organizationName: string;
  industryName?: string | null;
  countryName?: string | null;
  regionName?: string | null;
  telephone1?: string | null;
  telephone2?: string | null;
}