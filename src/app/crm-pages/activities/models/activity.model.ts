import { GenericIdName } from "@/common/models/generic-id-name.model";

export interface Activity {
    objectType: string,
    objectId?: number,
    status: boolean | string,
    subject: string,
    modifiedBy?: string,
    createdBy?: string,
    createdOn?: Date,
    modifiedOn?: Date,
    activityId?: number,
    isDeleted?: string,
    meetingAgendaActivityId?: number,
    assignee?: number | GenericIdName,
    dueDate?: Date | string,
    notes?: string,
    activityTypeId: number,
    activityTypeCode: string,
    assigneeName?: string,
    objectName?: string;
}
