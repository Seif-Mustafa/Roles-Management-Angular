export interface LeadDataTable {
    leadId: number
    leadTitle: string;
    leadDesc: string;
    organizationName: string;
    targetDate: string | Date; // Should be in 'YYYY-MM-DD' format
    personName: string;
    createdOn: string | Date;
    createdBy: string;
    personId?: number;        // ⬅️ جديد
    leadLabel?: string;       // ⬅️ جديد
    leadSource?: string;      // ⬅️ جديد
    clientType: string
    newOrganization: string;
    newPerson: string;
    newPersonTitle: string;
    newPersonMobile: string;
    newPersonEmail: string;
    newOrganizaionAddress: string;

    // دول الإضافات ↓↓↓
    leadUserId: number
}
