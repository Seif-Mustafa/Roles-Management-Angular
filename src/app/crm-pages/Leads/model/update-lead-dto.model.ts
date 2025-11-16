
// update-lead-dto.model.ts
export interface UpdateLeadDto {
  leadId: number;
  leadTitle: string;
  leadDesc: string;
  leadLabel: string;
  leadSource: string;
  targetDate: string;            // 'YYYY-MM-DD'

  clientType?: 'S' | 'O' | 'P';   // لازم تبقى واحدة من دول

  // نفس أسامي الحقول اللي في الباك (حتى لو فيها typo):
  newOrganization: string;
  newPerson: string;
  newPersonTitle: string;
  newPersonMobile: string;
  newPersonEmail: string;
  newOrganizaionAddress: string; // لاحظ الـ typo زي اللي في الباك

  leadUserId: number;

  // اختياري: السيرفر الحالي لا يحدّثه (انظر نقطة 2)
  personId?: number | null |undefined ;
}

