// Person row model (table-friendly)
export interface PersonDataTable {
  id: number;                  // personId
  personName: string;
  firstName?: string | null;   // للعرض/الفورم
  secondName?: string | null;  // alias لـ lastN ame
  organizationName?: string | null;
  oraganizationId?: number | null;
  phone?: string | null;
  mobile?: string | null;      // phone2
  email?: string | null;
  position?: string | null;    // Title
  comments?: string | null;    // feedback
  createdBy?: string | null;
  isGeneral?: 'Y' | 'N' | string | null;
}
