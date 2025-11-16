export interface NoteCardCreateDto {
    noteDesc: string;
    objectId: number;
    objectType: string;  // You could make this more specific, e.g., 'D' | 'L' | 'P'
    isPinned: string;    // You could use 'Y' | 'N'

    // Optional fields from your comments
    dealId?: number | null;
    organizationId?: number | null; // Corrected typo from "oraganizationId"
    personId?: number | null;
    createdBy: string;

}
