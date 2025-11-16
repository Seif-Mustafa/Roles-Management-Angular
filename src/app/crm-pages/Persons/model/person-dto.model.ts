export interface PersonDto {
  personId?: number;
  personName?: string;
  oraganizationId?: number;
  phone?: string;
  email?: string;
  createdBy?: string;
  createdOn?: string;       // using string instead of Timestamp
  modifiedBy?: string;
  modifiedOn?: string;      // same here
  isDeleted?: string;
  nationalId?: string;
  position?: string;
  feedback?: string;
  serviceProduct?: string;
  phone2?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
  isGeneral?: string;
  failureReason?: string;
}
