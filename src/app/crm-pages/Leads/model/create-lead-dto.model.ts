export interface CreateLeadDto {
  leadTitle: string;
  leadDesc: string;
  personId: number |null | undefined;
  leadLabel: string;
  leadSource: string;
  targetDate: string | Date; // Should be in 'YYYY-MM-DD' format

  /**
   * Defines the type of client.
   * 's' -> Standalone
   * 'orgnization' -> New Organization
   * 'person' -> New Person
   */
  clientType?: 'S' | 'O' | 'P' |string;

  // These fields might be optional depending on the clientType
  // You can add a '?' to make them optional, e.g., newOrganization?: string;
  newOrganization: string;
  newPerson: string;
  newPersonTitle: string;
  newPersonMobile: string;
  newPersonEmail: string;
  newOrganizaionAddress: string;
  leadUserId: number;
  newPersonFirstName:string;
  newPersonLastName:string;



}
