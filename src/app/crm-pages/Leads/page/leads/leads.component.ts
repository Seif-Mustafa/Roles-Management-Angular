import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// RxJS
import { forkJoin, map, tap, finalize } from 'rxjs';

// خدمات ونماذجك
import { LeadsService } from '../../leads.service';
import { CommonRequestsService } from '@/common/services/common-requests.service';
import { CreateLeadDto } from '../../model/create-lead-dto.model';
import { UpdateLeadDto } from '../../model/update-lead-dto.model';
import { LeadDataTable } from '../../model/lead-data-table.model';
import { TooltipModule } from 'primeng/tooltip';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { CarouselModule } from "primeng/carousel";
import { ActivityCradDto } from '../../model/activity-crad-dto.model';
import { NoteCradDto } from '../../model/note-crad-dto.model';
import { NoteCardCreateDto } from '../../model/note-card-create-dto.model';
import { TranslateModule } from '@ngx-translate/core';
import { Activity } from '@/crm-pages/activities/models/activity.model';
import { CheckboxModule } from 'primeng/checkbox';
import { ActivitiesService } from '@/crm-pages/activities/activities.service';
import { MessageService, ConfirmationService } from 'primeng/api';

// لو عندك موديل GenericIdName جاهز استخدمه، وإلا استخدم النوع البسيط ده:
export type GenericIdName = { id: number; name: string };

@Component({
  selector: 'app-leads',
  standalone: true,
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
  imports: [
    CommonModule, FormsModule,
    DialogModule, ButtonModule, InputTextModule, TextareaModule,
    RadioButtonModule, ToastModule, DatePickerModule, AutoCompleteModule,
    ProgressSpinnerModule, TableModule, ToolbarModule,
    IconFieldModule, InputIconModule, ConfirmDialogModule, TooltipModule,
    CarouselModule,
    MatTabGroup,
    MatTab,
    TranslateModule,
    CheckboxModule,

  ],
  providers: [MessageService, ConfirmationService]
})
export class LeadsComponent {

  collapsed = true;
  preview: LeadDataTable | null = null;

  @ViewChild('dt') dt!: Table;

  // ===== Table =====
  rows: LeadDataTable[] = [];
  selected: LeadDataTable[] = [];
  loading = false;
  exportFileName = `leads_${new Date().toISOString().slice(0, 10)}`;
  selectedView: 'A' | 'O' | 'P' | 'NON' | 'ARC' = 'A';

  // ===== Dialog/Form =====
  leadDialog = false;
  dialogLoading = false;      // يفتح الـ spinner لحد ما الداتا تجهّز
  personLoading = false;      // spinner صغير للأشخاص فقط
  editingId: number | null = null;
  // notes = [
  //   {
  //     text: 'sdsdsdsdfsdfsdfsd',
  //     date: '25/10/2025',
  //     time: '02:45',
  //     by: 'shehab'
  //   },
  //   {
  //     text: 'sdsds',
  //     date: '25/10/2025',
  //     time: '02:45',
  //     by: 'shehab'
  //   },
  //   {
  //     text: 'sdsds',
  //     date: '25/10/2025',
  //     time: '02:45',
  //     by: 'shehab'
  //   }
  // ];



  newNoteText: any;
  get isEdit(): boolean { return this.editingId !== null; }

  // نموذج مبسّط
  leadForm: Partial<CreateLeadDto> = {
    clientType: 'S',
    leadLabel: 'New',
    leadSource: 'Manual',
    targetDate: new Date(),
  };

  // ===== Org / Person pickers =====
  orgSelectedAutoValue: GenericIdName | null = null;
  orgDropDownList: GenericIdName[] = [];
  orgAutoFiltered: GenericIdName[] = [];
  selectedOrgId: number | null = null;


  personSelectedAutoValue: GenericIdName | null = null;
  personDropDownList: GenericIdName[] = [];
  personAutoFiltered: GenericIdName[] = [];
  personIdText = ''; // للاحتفاظ بالـ id كسلسلة عند الحفظ

  exportColumns = [
    { field: 'leadTitle', header: 'Lead Title' },
    { field: 'organizationName', header: 'Organization' },
    { field: 'personName', header: 'Person' },
    { field: 'targetDate', header: 'Target Date' },
    { field: 'createdOn', header: 'Created On' },
    { field: 'createdBy', header: 'Created By' },
    { field: 'leadDesc', header: 'Description' }
  ];

  activities: ActivityCradDto[] = [];
  notes: NoteCradDto[] = [];


  constructor(
    private leadsService: LeadsService,
    private commonRequests: CommonRequestsService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    // private toastService: ToastService,
    private activitiesService: ActivitiesService,

  ) { }

  fetchActivity(leadId: string | number): void {
    this.loading = true;
    // const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
    // const leadId = 525;
    this.leadsService.getActivitiesByLeadId(leadId).subscribe({
      next: (res: any) => {
        // const data: any[] = res?.data ?? [];
        // this.rows = data.map(this.mapLeadRow);
        // this.loading = false;
        this.activities = (res?.data as ActivityCradDto[]) ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // Check for a more specific error message from the backend response
        const detail = err?.error?.message ?? err?.message ?? 'Failed to load activities';
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: detail
        });
      }
    });
  }
  fetchNotes(leadId: string | number): void {
    this.loading = true;
    // const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
    // const leadId = 525;
    this.leadsService.getNotesByLeadId(leadId).subscribe({
      next: (res: any) => {
        this.notes = (res?.data as NoteCradDto[]) ?? [];
        console.log("testNotes>", this.notes)
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // Check for a more specific error message from the backend response
        const detail = err?.error?.message ?? err?.message ?? 'Failed to load notes';
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: detail
        });
      }
    });
  }

  // ===== Lifecycle =====
  ngOnInit(): void {

    // console.log("testActivity>", this.leadsService.getActivitiesByLeadId(525));
    // console.log("testNotes>", this.leadsService.getNotesByLeadId(863));

    const saved = localStorage.getItem('leads.details.collapsed');
    // default should be collapsed = true (panel hidden, table full width)
    this.collapsed = saved === null ? true : (saved === 'true');


    // const saved = localStorage.getItem('leads.details.collapsed');
    // this.collapsed = saved ? saved === 'true' : false;
    // if (saved !== null) this.collapsed = (saved === 'true');
    this.resolveDialogData$()
    // this.getPeople$();
    this.fetch();
  }

  toggleDetails(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem('leads.details.collapsed', String(this.collapsed));
    if (!this.collapsed && this.preview?.leadId != null) {
      this.fetchActivity(this.preview.leadId);
      this.fetchNotes(this.preview.leadId);
    }
  }

  openPreview(row: LeadDataTable): void {
    this.preview = row;

    // if (this.collapsed) {
    //   this.collapsed = false;
    //   localStorage.setItem('leads.details.collapsed', 'false'); // keep same behavior as toggleDetails()
    // }

    console.log("row >", row.leadId)
    if (!this.collapsed && row?.leadId != null) {
      this.fetchActivity(row.leadId);
      this.fetchNotes(row.leadId);
    }
    // this.collapsed = false;
  }

  isAmount(v: any): boolean {
    const n = Number(v);
    return Number.isFinite(n);
  }

  // ===== Server calls =====
  fetch(): void {
    this.loading = true;
    const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
    // build query params for backend

    const payload = {
      userId,                                // -> :p_user_id
      view: this.selectedView,               // -> :p_view
      leadTitle: this.filter.leadTitle || null,     // -> :p_lead_title
      personName: this.filter.personName || null,   // -> :p_person_name
      orgName: this.filter.orgName || null,         // -> :p_org_name
      leadSource: null                       // we’re not filtering by source yet, but backend needs param
    };
    this.leadsService.getLeadsRows(payload).subscribe({
      next: (res: any) => {
        const data: any[] = res?.data ?? [];
        this.rows = data.map(this.mapLeadRow);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to load leads' });
      }
    });
  }

  private mapLeadRow = (r: any): LeadDataTable => {
    const toDate = (v: any) => {
      if (!v) return '';
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d;
    };
    return {
      leadId: Number(r?.leadId ?? r?.LEAD_ID ?? 0),
      leadTitle: r?.leadTitle ?? r?.LEAD_TITLE ?? '',
      leadDesc: r?.leadDesc ?? r?.LEAD_DESC ?? '',
      organizationName: r?.organizationName ?? r?.ORGANIZATION_NAME ?? '',
      personName: r?.personName ?? r?.PERSON_NAME ?? '',
      targetDate: toDate(r?.targetDate ?? r?.TARGET_DATE),
      createdOn: toDate(r?.createdOn ?? r?.CREATED_ON),
      createdBy: r?.createdBy ?? r?.CREATED_BY ?? '',
      personId: Number(r?.personId ?? r?.PERSON_ID ?? 0) || undefined,
      leadLabel: r?.leadLabel ?? r?.LEAD_LABEL ?? '',
      leadSource: r?.leadSource ?? r?.LEAD_SOURCE ?? '',
      clientType: r?.clientType ?? r?.clientType ?? '',
      newOrganization: r?.newOrganization ?? r?.newOrganization ?? '',
      newPerson: r?.newPerson ?? r?.newPerson ?? '',
      newPersonTitle: r?.newPersonTitle ?? r?.newPersonTitle ?? '',
      newPersonMobile: r?.newPersonMobile ?? r?.newPersonMobile ?? '',
      newPersonEmail: r?.newPersonEmail ?? r?.newPersonEmail ?? '',
      newOrganizaionAddress: r?.newOrganizaionAddress ?? r?.newOrganizaionAddress ?? '',
      leadUserId: Number(r?.leadUserId ?? r?.LEAD_USER_ID ?? 0),
    };
  };

  // ===== Lists =====
  private getOrgs$() {
    return this.commonRequests.getAllOrgsIdAndName().pipe(
      map((res: any) => (res?.data ?? []).map((x: any) => ({
        id: Number(x?.id ?? x?.organizationId ?? 0),
        name: String(x?.name ?? x?.organizationName ?? '')
      })).filter((o: GenericIdName) => o.id && o.name)),
      tap(list => {
        this.orgDropDownList = list;
        this.orgAutoFiltered = list.slice(0, 50);
      })
    );
  }

  private getPeople$() {
    return this.commonRequests.getPersonIdAndName().pipe(
      map((res: any) => (res?.data ?? []).map((x: any) => ({
        id: Number(x?.id ?? x?.personId ?? 0),
        name: String(x?.name ?? x?.personName ?? '')
      })).filter((p: GenericIdName) => p.id && p.name)),
      tap(list => {
        this.personDropDownList = list;
        this.personAutoFiltered = list.slice(0, 50);
      })
    );
  }

  private resolveDialogData$(row?: LeadDataTable) {
    return forkJoin({ orgs: this.getOrgs$(), people: this.getPeople$() }).pipe(
      tap(() => {
        // Ensure selected person exists in list on edit
        if (row?.personId && !this.personDropDownList.some(p => p.id === row.personId)) {
          const sel = { id: row.personId, name: row.personName ?? '' };
          this.personDropDownList = [sel, ...this.personDropDownList];
          this.personAutoFiltered = this.personDropDownList.slice(0, 50);
        }
      })
    );
  }

  // ===== Toolbar =====
  onGlobalFilter(ev: Event) {
    const q = (ev.target as HTMLInputElement).value;
    this.dt.filterGlobal(q, 'contains');
  }
  exportCSV() { this.dt.exportCSV({ selectionOnly: false }); }

  // ===== Pickers helpers =====
  filterOrgList(e: AutoCompleteCompleteEvent) {
    const q = (e.query || '').toLowerCase().trim();
    const list = this.orgDropDownList;
    this.orgAutoFiltered = !q ? list.slice(0, 50) : list.filter(x => (x.name || '').toLowerCase().includes(q));
  }
  filterPersonList(e: AutoCompleteCompleteEvent) {
    const q = (e.query || '').toLowerCase().trim();
    const list = this.personDropDownList;
    this.personAutoFiltered = !q ? list.slice(0, 50) : list.filter(x => (x.name || '').toLowerCase().includes(q));

  }

  private loadPeopleForOrg$(orgId: number, userId: number, salesRoleType: number) {
    // 👇 you will implement this in your service (see below)

    return this.commonRequests.getPersonsUsersByOrg(orgId, userId, salesRoleType).pipe(
      map((res: any) => (res?.data ?? []).map((x: any) => ({
        id: Number(x?.id ?? x?.personId ?? 0),
        name: String(x?.name ?? x?.personName ?? '')
      })).filter((p: GenericIdName) => p.id && p.name)),
      tap(list => {
        // replace the dropdown source with ONLY people from that org
        this.personDropDownList = list;
        this.personAutoFiltered = list.slice(0, 50);
      })
    );
  }


  openOrgSuggestions(): void {
    if (!this.orgDropDownList.length) {
      this.getOrgs$().subscribe();
    } else {
      this.orgAutoFiltered = this.orgDropDownList.slice(0, 50);
    }
  }
  openPersonSuggestions(): void {
    // if (!this.personDropDownList.length) {
    //   this.personLoading = true;
    //   this.getPeople$().pipe(finalize(() => this.personLoading = false)).subscribe(() => {
    //     this.personAutoFiltered = this.personDropDownList.slice(0, 50);
    //   });
    // } else {
    //   this.personAutoFiltered = this.personDropDownList.slice(0, 50);
    // }
    // if we already loaded for this org, just reuse it
    if (this.selectedOrgId != null && this.personDropDownList.length) {
      this.personAutoFiltered = this.personDropDownList.slice(0, 50);
      return;

    }

    // if org is selected but we haven't loaded yet (first time):
    if (this.selectedOrgId != null) {
      this.personLoading = true;
      const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
      const salesRoleType = this.leadsService['layout']?.getLoggedUser?.()?.userRoleTypeId || 0;
      this.loadPeopleForOrg$(this.selectedOrgId, userId, salesRoleType)
        .pipe(finalize(() => this.personLoading = false))
        .subscribe(() => {
          this.personAutoFiltered = this.personDropDownList.slice(0, 50);
        });
      return;
    }
  }

  // onOrgSelect(event: GenericIdName): void {
  //   this.orgSelectedAutoValue = event;
  //   // Reset people if you depend on org filtering (عند الحاجة)
  //   this.personSelectedAutoValue = null;
  //   this.personIdText = '';
  //   // load people for this org
  //   this.personLoading = true;
  //   const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
  //   const salesRoleType = this.leadsService['layout']?.getLoggedUser?.()?.userRoleTypeId || 0;
  //   this.loadPeopleForOrg$(org.id ,userId,salesRoleType)
  //     .pipe(finalize(() => this.personLoading = false))
  //     .subscribe();
  // }
  onOrgSelect(event: GenericIdName): void {
    this.orgSelectedAutoValue = event;
    this.selectedOrgId = event.id; // <-- keep it, we reuse later

    // clear current person selection because org changed
    this.personSelectedAutoValue = null;
    this.personIdText = '';
    this.leadForm.personId = null;

    // load people for this org
    this.personLoading = true;

    const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
    const salesRoleType = this.leadsService['layout']?.getLoggedUser?.()?.userRoleTypeId || 0;
    // if your backend expects a string, you can do: const salesRoleType = String(...)

    this.loadPeopleForOrg$(event.id, userId, salesRoleType)
      .pipe(finalize(() => this.personLoading = false))
      .subscribe();
  }

  onOrgClear(): void {
    this.orgSelectedAutoValue = null;
    this.personSelectedAutoValue = null;
    this.personIdText = '';


    // clear current person binding
    this.personSelectedAutoValue = null;
    this.personIdText = '';
    this.leadForm.personId = null;

    // reload the "global" people list (all people)
    this.personLoading = true;
    this.getPeople$()
      .pipe(finalize(() => this.personLoading = false))
      .subscribe(() => {
        this.personAutoFiltered = this.personDropDownList.slice(0, 50);
      });
  }

  onPersonSelect(p: GenericIdName): void {
    this.personSelectedAutoValue = p;
    this.personIdText = String(p?.id ?? '');
    this.leadForm.personId = p?.id ?? null;
  }
  onPersonClear(): void {
    this.personSelectedAutoValue = null;
    this.personIdText = '';
    this.leadForm.personId = null;
    this.openPersonSuggestions();
  }

  // ===== Dialog open =====
  openLeadDialog() {
    this.getPeople$
    this.leadDialog = true;
    this.editingId = null;          // create mode
    this.dialogLoading = false;
    const loggedUserId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId || 0);
    const loggedUserName = this.leadsService['layout']?.getLoggedUser?.()?.username || '';

    // reset form for create
    this.leadForm = {
      clientType: 'S',
      leadLabel: 'New',
      leadSource: 'Manual',
      targetDate: new Date(),
      leadTitle: '',
      leadDesc: '',
      newOrganization: '',
      newPerson: '',
      newPersonTitle: '',
      newPersonMobile: '',
      newPersonEmail: '',
      newOrganizaionAddress: '',
      leadUserId: loggedUserId, // default owner
    };
    this.personSelectedAutoValue = null;
    this.personIdText = '';

    // preselect assignee UI with current user
    this.assigneeSelectedAutoValue = {
      id: loggedUserId,
      name: loggedUserName
    };

    this.resolveDialogData$()
      .pipe(finalize(() => this.dialogLoading = false))
      .subscribe();
  }

  private patchRow(leadId: number, patch: Partial<LeadDataTable>) {
    this.rows = this.rows.map(r => r.leadId === leadId ? { ...r, ...patch } : r);
    if (this.preview?.leadId === leadId) {
      this.preview = { ...this.preview, ...patch };
    }
  }

  openEdit(row: LeadDataTable) {
    // this.openPreview(row);
    this.editingId = row.leadId;
    this.leadDialog = true;
    this.dialogLoading = true;

    this.leadForm = {
      clientType: row.clientType ?? 'O',
      leadTitle: row.leadTitle ?? '',
      leadDesc: row.leadDesc ?? '',
      leadLabel: row.leadLabel ?? 'New',
      leadSource: row.leadSource ?? 'Manual',
      targetDate: row.targetDate ? new Date(row.targetDate as any) : new Date(),
      newOrganization: row.newOrganization ?? '',
      newPerson: row.newPerson ?? '',
      newPersonTitle: row.newPersonTitle ?? '',
      newPersonMobile: row.newPersonMobile ?? '',
      newPersonEmail: row.newPersonEmail ?? '',
      newOrganizaionAddress: row.newOrganizaionAddress ?? '',
      personId: row.personId ?? null,
      // leadUserId: row.leadUserId ?? loggedUserId

    };
    console.log("here is", row.clientType)

    if (row.personId) {
      this.personSelectedAutoValue = { id: row.personId, name: row.personName ?? '' };
      this.personIdText = String(row.personId);
    } else {
      this.personSelectedAutoValue = null;
      this.personIdText = '';
    }
    const v = String(row.clientType ?? (row.personId ? 'S' : 'O')).toUpperCase();
    this.leadForm = { ...this.leadForm, clientType: (v === 'S' || v === 'O' || v === 'P') ? v as any : 'O', /*…*/ };

    this.resolveDialogData$(row)
      .pipe(finalize(() => this.dialogLoading = false))
      .subscribe();
  }

  // ===== Save/Delete =====
  private toYYYYMMDD(d: Date | string): string {
    const date = typeof d === 'string' ? new Date(d) : d;
    const off = date.getTimezoneOffset();
    return new Date(date.getTime() - off * 60000).toISOString().slice(0, 10);
  }

  save(): void {
    if (!this.leadForm.leadTitle?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Missing', detail: 'Lead name is required' });
      return;
    }

    const clientType = (this.leadForm.clientType as 'S' | 'O' | 'P') || 'S';
    const userId = Number(this.leadsService['layout']?.getLoggedUser?.()?.userId) || 0;

    if (this.isEdit) {
      let personId: number | undefined;
      const parsed = Number.parseInt(this.personIdText || '0', 10);
      const finalAssigneeId =
        this.leadForm.leadUserId ??
        this.assigneeSelectedAutoValue?.id ??
        userId; // fallback
      if (Number.isFinite(parsed) && parsed > 0) personId = parsed;

      const upd: UpdateLeadDto = {
        leadId: this.editingId!,
        leadTitle: (this.leadForm.leadTitle || '').trim(),
        leadDesc: (this.leadForm.leadDesc || '').trim(),
        leadLabel: this.leadForm.leadLabel || 'New',
        leadSource: this.leadForm.leadSource || 'Manual',
        targetDate: this.toYYYYMMDD(this.leadForm.targetDate || new Date()),
        clientType,
        newOrganization: this.leadForm.newOrganization || '',
        newPerson: this.leadForm.newPerson || '',
        newPersonTitle: this.leadForm.newPersonTitle || '',
        newPersonMobile: this.leadForm.newPersonMobile || '',
        newPersonEmail: this.leadForm.newPersonEmail || '',
        newOrganizaionAddress: this.leadForm.newOrganizaionAddress || '',
        leadUserId: finalAssigneeId,   // 👈 هنا التعديل الحقيقي
        personId
      };

      this.leadsService.updateLead([upd]).subscribe({
        next: (res: any) => {
          const ok = Number(res?.status) === 200 || Number(res?.status) === 207;
          if (ok) {
            this.patchRow(this.editingId!, {
              leadTitle: upd.leadTitle,
              leadDesc: upd.leadDesc,
              leadLabel: upd.leadLabel,
              leadSource: upd.leadSource,
              targetDate: upd.targetDate,
              personId: personId,
              personName: this.personSelectedAutoValue?.name || ''
            });
            this.toast.add({ severity: 'success', summary: 'Updated', detail: 'Lead updated' });
            this.leadDialog = false;
            this.editingId = null;
            this.reset();
            this.fetch();
          } else {
            this.toast.add({ severity: 'warn', summary: 'Not updated', detail: res?.message || 'Validation failed' });
          }
        },
        error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Update failed' })
      });

    } else {
      const finalAssigneeId =
        this.leadForm.leadUserId ??
        this.assigneeSelectedAutoValue?.id ??
        userId; // fallback
      let personId = null;
      if (clientType === 'S') {
        personId = Number.parseInt(this.personIdText || '0', 10);
        if (!Number.isFinite(personId) || personId <= 0) {
          this.toast.add({ severity: 'warn', summary: 'Missing', detail: 'Valid person is required' });
          return;
        }
      }
      if (clientType === 'O' && !this.leadForm.newOrganization?.trim()) {
        this.toast.add({ severity: 'warn', summary: 'Missing', detail: 'Organization name is required' });
        return;
      }
      if (
        clientType === 'P' && (!this.leadForm.newPersonFirstName?.trim() || !this.leadForm.newPersonLastName?.trim())) {
        this.toast.add({
          severity: 'warn',
          summary: 'Missing',
          detail: 'First name and Last name are required'
        });
        return;
      }

      const payload: CreateLeadDto = {
        leadTitle: this.leadForm.leadTitle!.trim(),
        leadDesc: this.leadForm.leadDesc?.trim() || '',
        personId,
        leadLabel: this.leadForm.leadLabel || 'New',
        leadSource: this.leadForm.leadSource || 'Manual',
        targetDate: this.toYYYYMMDD(this.leadForm.targetDate || new Date()),
        clientType,
        newOrganization: this.leadForm.newOrganization || '',
        newPerson: this.leadForm.newPerson || '',
        newPersonTitle: this.leadForm.newPersonTitle || '',
        newPersonMobile: this.leadForm.newPersonMobile || '',
        newPersonEmail: this.leadForm.newPersonEmail || '',
        newOrganizaionAddress: this.leadForm.newOrganizaionAddress || '',
        leadUserId: finalAssigneeId,   // 👈 التعديل هنا
        newPersonFirstName: this.leadForm.newPersonFirstName || '',
        newPersonLastName: this.leadForm.newPersonLastName || ''

      };
      console.log("this is for create", payload);

      this.leadsService.createLeed([payload]).subscribe({
        next: (res: any) => {
          const status = Number(res?.status);
          if (status === 200 || status === 207) {
            this.toast.add({ severity: 'success', summary: 'Created', detail: 'Lead created' });
            this.leadDialog = false;
            this.reset();
            this.fetch();
          } else {
            this.toast.add({ severity: 'warn', summary: 'Not created', detail: res?.message || 'Validation failed' });
          }
        },
        error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Create failed' })
      });
    }
  }

  // private patchRow(leadId: number, patch: Partial<LeadDataTable>) {
  //   this.rows = this.rows.map(r => r.leadId === leadId ? { ...r, ...patch } : r);
  // }

  private reset(): void {
    this.editingId = null;
    this.leadForm = {
      clientType: 'S',
      leadLabel: 'New',
      leadSource: 'Manual',
      targetDate: new Date(),
      leadTitle: '',
      leadDesc: '',
      newOrganization: '',
      newPerson: '',
      newPersonTitle: '',
      newPersonMobile: '',
      newPersonEmail: '',
      newOrganizaionAddress: ''
    };
    this.orgSelectedAutoValue = null;
    this.orgAutoFiltered = [];
    this.personSelectedAutoValue = null;
    this.personDropDownList = [];
    this.personAutoFiltered = [];
    this.personIdText = '';
  }

  // ===== Delete =====
  confirmDeleteSelected(): void {
    if (!this.selected?.length) {
      this.toast.add({ severity: 'warn', summary: 'Nothing selected', detail: 'Select at least one lead' });
      return;
    }
    const ids = this.selected.map(r => r.leadId).filter(Boolean);
    this.confirm.confirm({
      message: `Delete ${ids.length} lead(s)?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.doDelete(ids)
    });
  }
  private doDelete(ids: (number | string)[]): void {
    this.leadsService.deleteLead(ids).subscribe({
      next: (res) => {
        this.rows = this.rows.filter(r => !ids.includes(r.leadId));
        this.selected = [];
        const status = String(res?.status || '');
        this.toast.add({
          severity: status === '200' ? 'success' : status === '207' ? 'warn' : 'info',
          summary: 'Delete result',
          detail: res?.message || `Request finished with status ${status}`,
          life: 6000
        });
        this.fetch();
      },
      error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Delete failed' })
    });
  }

  // Placeholders لغاية ما توصل APIs
  get hasNotes(): boolean { return false; }
  get hasActivities(): boolean { return false; }

  tabItems = [
    { key: 'notes', label: 'Notes' },
    { key: 'activities', label: 'Activities' }
  ];

  page = 0; // 0 = Notes, 1 = Activities

  go(i: number) { this.page = i; }
  prev() { if (this.page > 0) this.page--; }
  next() { if (this.page < this.tabItems.length - 1) this.page++; }



  addNote(): void {
    const text = (this.newNoteText || '').trim();

    console.log("here in addNote ");
    // 1. block empty note
    if (!text) {
      this.toast.add({
        severity: 'warn',
        summary: 'Empty note',
        detail: 'Please write your note before adding.'
      });
      return;
    }

    // 2. figure out what we're attaching the note to
    //    here: we're assuming notes are attached to a Lead
    //    so objectId = leadId from preview
    const parentId = this.preview?.leadId ?? 0;

    // 3. build the DTO to send to backend
    const currentUserName =
      this.leadsService['layout']?.getLoggedUser?.()?.username ||
      ' ';

    const createDto: NoteCardCreateDto = {
      noteDesc: text,
      objectId: parentId,
      objectType: 'L',      // 'L' = Lead (adjust if backend uses different code)
      isPinned: 'N',
      dealId: null,
      organizationId: null,
      personId: null,
      createdBy: currentUserName
    };

    // 4. optimistic UI item (what we'll show immediately)
    const now = this.getNowDateTime();
    const optimisticNote: NoteCradDto = {
      noteDesc: createDto.noteDesc,
      createdOn: now,
      createdBy: createDto.createdBy,
      // isPinned: createDto.isPinned
    };

    // add to UI first (optimistic)
    this.notes.unshift(optimisticNote);

    // clear the textarea right away so UI feels responsive
    this.newNoteText = '';

    // show success toast immediately
    this.toast.add({
      severity: 'success',
      summary: 'Note added',
      detail: 'Your note was added.'
    });

    // 5. call backend to actually save
    this.leadsService.createNote([createDto]).subscribe({
      next: (res) => {
        // OPTIONAL: if backend returns real noteId / createdOn etc,
        // you can patch the optimistic note here.

        // Example if API responds with: { status: 200, data: [{ noteId: 123, createdOn: "...", ...}] }
        // You can merge it in like this:
        //
        // if (res?.status === 200 && Array.isArray(res?.data) && res.data[0]) {
        //   const real = res.data[0];
        //   // find optimistic note and update it
        //   const idx = this.notes.findIndex(n => n.noteId === optimisticNote.noteId);
        //   if (idx !== -1) {
        //     this.notes[idx] = {
        //       ...this.notes[idx],
        //       noteId: real.noteId ?? this.notes[idx].noteId,
        //       createdOn: real.createdOn ?? this.notes[idx].createdOn,
        //       createdBy: real.createdBy ?? this.notes[idx].createdBy,
        //     };
        //   }
        // }
      },
      error: (err) => {
        // If save failed, roll back the optimistic insert
        // this.notes = this.notes.filter(n => n.noteId !== optimisticNote.noteId);

        // restore textarea so user doesn't lose what they wrote
        this.newNoteText = text;

        // show error toast
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.message || 'Failed to save note'
        });
      }
    });
  }



  pad2(v: number): string {
    return v < 10 ? '0' + v : '' + v;
  }

  getNowDateTime(): string {
    const d = new Date();
    const dd = this.pad2(d.getDate());
    const mm = this.pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const hh = this.pad2(d.getHours());
    const mi = this.pad2(d.getMinutes());
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }


  activity!: Activity;



  onChangeActivityType(value: number) {
    this.activity.activityTypeId = value;
    if (value === 1) {
      this.activity.activityTypeCode = 'C';
    } else if (value === 2) {
      this.activity.activityTypeCode = 'M';
    } else if (value === 3) {
      this.activity.activityTypeCode = 'T';
    }
  }

  submitted: boolean = false;
  activityDialog: boolean = false;


  hideDialog() {
    this.activityDialog = false;
    this.submitted = false;
  }

  saveActivity() {
    this.submitted = true;

    if (this.activity.subject.length === 0) {
      this.toast.add({
        severity: 'error',
        summary: 'common.error',
        detail: 'activities.subject_is_required'
      });
      return;
    } else if (this.activity.dueDate === undefined) {
      // Assuming 'toastService' is your variable for MessageService, just like 'toast'
      this.toast.add({
        severity: 'error',
        summary: 'common.error',
        detail: 'activities.due_date_is_required'
      });
      return;
    }

    const assigneeId = typeof this.activity.assignee === 'object' && this.activity.assignee !== null ? this.activity.assignee.id : this.activity.assignee;

    let formattedDueDate: string | undefined;
    if (this.activity.dueDate) {
      const date = new Date(this.activity.dueDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      formattedDueDate = `${year}-${month}-${day}`;
    }
    const currentUserName =
      this.leadsService['layout']?.getLoggedUser?.()?.username ||
      ' ';
    const userId =
      this.leadsService['layout']?.getLoggedUser?.()?.userId ||
      ' ';
    const parentId = this.preview?.leadId ?? 0;

    const payload: Activity = {
      ...this.activity,
      assignee: Number(userId),
      dueDate: formattedDueDate,
      createdBy: currentUserName,
      objectId: parentId
    };

    console.log(payload);
    this.activitiesService.createActivity(payload).subscribe({
      next: (res) => {
        // Fixed: Changed this.toast.(...) to this.toast.success(...)
        // this.toast.success('common.success', 'activities.activity_created_successfully');
        this.toast.add({
          severity: 'success',
          summary: 'common.success',
          detail: 'activities.activity_created_successfully'
        });
      },
      error: (error) => {
        // this.toast.error('common.error', 'activities.failed_to_create_activity');
        this.toast.add({
          severity: 'error',
          summary: 'common.error',
          detail: 'activities.failed_to_create_activity'
        });
      },
      complete: () => {
        this.loading = false;
        this.activityDialog = false;
        // this.loadActivities({ first: 0, rows: this.tableRowsCount() } as TableLazyLoadEvent);
      }
    });

  }

  openNewActivity() {
    this.activity = {
      "subject": "",
      "notes": "",
      "status": "I", // I / D
      "activityTypeId": 1, // 1 = call / 2 = meeting / 3 = task
      "objectType": "L", // O / P / D
      "activityTypeCode": "C" // C / M / T
    };
    // this.selectedPerson = null;
    // this.selectedDeal = null;
    // this.selectedOrganization = null;

    this.submitted = false;
    this.activityDialog = true;
  }


  filter = {
    leadTitle: '',
    personName: '',
    orgName: ''
  };

  clearFilters(): void {
    this.filter.leadTitle = '';
    this.filter.personName = '';
    this.filter.orgName = '';
    this.fetch(); // reload table with empty filters
  }

  assigneeSelectedAutoValue: GenericIdName | null = null;
  assigneeDropDownList: GenericIdName[] = [];
  assigneeAutoFiltered: GenericIdName[] = [];
  assigneeLoading = false;

  private getAssignableUsers$() {
    return this.leadsService.getActiveUsers().pipe(
      map((res: any) => {
        const arr = Array.isArray(res?.data) ? res.data : [];
        return arr
          .map((x: any) => ({
            id: Number(x?.id ?? x?.userId ?? 0),
            name: String(x?.name ?? x?.userName ?? x?.username ?? '')
          }))
          .filter((u: { id: any; name: any; }) => u.id && u.name);
      }),
      tap(list => {
        this.assigneeDropDownList = list;
        this.assigneeAutoFiltered = list.slice(0, 50);
      })
    );
  }

  filterAssigneeList(e: AutoCompleteCompleteEvent) {
    const q = (e.query || '').toLowerCase().trim();
    const list = this.assigneeDropDownList;
    this.assigneeAutoFiltered = !q
      ? list.slice(0, 50)
      : list.filter(x => (x.name || '').toLowerCase().includes(q));
  }

  openAssigneeSuggestions(): void {
    if (!this.assigneeDropDownList.length) {
      this.assigneeLoading = true;

      this.getAssignableUsers$()
        .pipe(finalize(() => (this.assigneeLoading = false)))
        .subscribe((list) => {
          console.log('Assignable users from service:', list);
          this.assigneeAutoFiltered = this.assigneeDropDownList.slice(0, 50);
        });
    } else {
      this.assigneeAutoFiltered = this.assigneeDropDownList.slice(0, 50);
    }
  }

  onAssigneeSelect(u: GenericIdName): void {
    this.assigneeSelectedAutoValue = u;
    this.leadForm.leadUserId = u.id; // دا المهم
  }

  onAssigneeClear(): void {
    this.assigneeSelectedAutoValue = null;
    this.leadForm.leadUserId = undefined as any;
  }



  editingNoteIdx: number | null = null; // which note is being edited




}
















