export interface UpdateOrgDto {

    // === IDs ===
    organizationId?: number;  // Required for updates, absent for creation
    industryId: number | null;       // The ID of the selected industry
    countryId: number | null;        // The ID of the selected country
    regionId: number | null;         // The ID of the selected region

    // === Core Information ===
    organizationName: string | null; // The mandatory name of the organization

    // === Contact Information (Optional) ===
    telephone1?: string | null;
    telephone2?: string | null;

    // === Audit Fields (managed by the system) ===
    createdBy?: string;
    createdOn?: string;       // Should be in ISO format, e.g., '2025-09-02T10:00:00'
    modifiedBy?: string;
    modifiedOn?: string;
}
