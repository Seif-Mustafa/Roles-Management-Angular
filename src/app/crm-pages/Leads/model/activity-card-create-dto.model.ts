export interface ActivityCardCreateDto {
    subject: string;
    notes: string;
    status: string;
    activityTypeId: number;
    objectType: string;
    activityTypeCode: string;
    dueDate: string; // Or Date if you plan to convert it before sending
    assignee: number;
    objectId: number;
}
