import { Component, ViewChild, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PersonsService } from '../../persons.service';
import { PersonDto } from '../../model/person-dto.model';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { GenericIdName } from '@/common/models/generic-id-name.model';
import { CommonRequestsService } from '@/common/services/common-requests.service';
import { CheckboxChangeEvent, Checkbox } from 'primeng/checkbox';
import { map, Observable, of, throwError } from 'rxjs';
import { TagModule } from "primeng/tag";



// Minimal interface for the table rows
export interface PersonDataTable {
  id: number;                  // personId
  personName: string;
  firstName?: string | null;   // للعرض/الفورم
  secondName?: string | null;  // alias لـ lastName
  organizationName?: string | null;
  organizationId?: number | null;
  phone?: string | null;
  mobile?: string | null;      // phone2
  email?: string | null;
  position?: string | null;    // Title
  comments?: string | null;    // feedback
  createdBy?: string | null;
  isGeneral?: 'Y' | 'N' | string | null;
  transferChecked?: boolean; // 👈 اختياري، UI فقط

  // userId:
}

@Component({
  selector: 'app-persons-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    AutoCompleteModule,
    Checkbox,
    TagModule
],
  templateUrl: './persons.component.html',
  providers: [MessageService, ConfirmationService]
})
export class PersonsComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('dt2') dt2!: Table; 

  // ===== Table State =====
  rows: PersonDataTable[] = [];
  rows2: PersonDto[] = [];

  loading = false;
  exportFileName = `persons_${new Date().toISOString().slice(0, 10)}`;

  exportColumns = [
    { field: 'personName', header: 'Person Name' },
    { field: 'organizationName', header: 'Organization' },
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'position', header: 'Position' },
    { field: 'createdBy', header: 'Created By' },
    { field: 'isGeneral', header: 'General Status' }
  ];

  // ===== Query Params (required by API) =====
  // qId: number | null = 761;            // default from your Postman screenshot
  // qSalesRoleType: number | null = 2;   // default from your Postman screenshot

  // ===== Dialog State =====
  personDialog = false;
  editing = false;
  submitted = false;
  form: Partial<PersonDataTable> | null = null;
  // form2: Partial<PersonDto> | null = null;
  form2: PersonDto = {} as PersonDto;
  isGeneralBool = false;

  constructor(
    private service: PersonsService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    private commonRequestsService: CommonRequestsService,
  ) { }

  ngOnInit(): void {


    // for test services requests 
    this.service.getTransferContactsData().//pipe(map(users => users.filter((u: { name: string; }) => u.name.startsWith('C')))).

      subscribe(
        {
          next: res => console.log("res>", res),
          error: err => console.log("err>", err.message),
          complete: () => console.log('done loading user')
        });




    this.loadOrgsList();
    this.fetch();
  }



  // ===== List =====
  orgSelectedAutoValue: GenericIdName | null = null;
  orgAutoFiltered: GenericIdName[] = [];
  orgDropDownList = signal<GenericIdName[]>([]);

  loadOrgsList(done?: () => void): void {
    this.commonRequestsService.getAllOrgsIdAndName().subscribe({
      next: (res: any) => {
        console.log('Raw API Response:', res); // DEBUG: Check what you're getting

        // ✅ Ensure proper mapping to GenericIdName interface
        const rawData = res?.data ?? [];
        const mappedOrgs: GenericIdName[] = rawData.map((x: any) => ({
          id: Number(x?.id ?? x?.organizationId ?? 0),
          name: String(x?.name ?? x?.organizationName ?? '')
        })).filter((org: GenericIdName) => org.id && org.name); // Remove invalid entries

        console.log('Mapped Organizations:', mappedOrgs); // DEBUG: Verify structure

        this.orgDropDownList.set(mappedOrgs);
        done?.();
      },
      error: (err) => {
        console.error('Error loading orgs:', err); // DEBUG
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load Organizations.'
        });
      }
    });
  }


  filterOrgList(e: AutoCompleteCompleteEvent) {
    const q = (e.query || '').toLowerCase().trim();
    const list = this.orgDropDownList();
    this.orgAutoFiltered = !q ? list.slice(0, 50) : list.filter(x => (x.name || '').toLowerCase().includes(q));
  }

  // orgs2: GenericIdName[] = [];
  // orgSuggestions: GenericIdName[] = [];
  // selectedOrg: GenericIdName | null = null;
  // orgs: { id: number; name: string }[] = [];
  // filteredOrgs: { id: number; name: string }[] = [];



  // ===== Fetch =====
  fetch(): void {

    this.loading = true;
    // this.service.getTableDataRaw(this.qId, this.qSalesRoleType).subscribe({
    this.service.getTableDataRaw().subscribe({
      next: (res: any) => {
        const data: any[] = res?.data ?? [];
        this.rows = data.map(this.mapRow);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to load persons' });
      }
    });

    // this.loadOrgsList();
  }

  // Support both camelCase and UPPER_CASE keys just in case
  private mapRow = (r: any): PersonDataTable => {
    const personName = r?.personName ?? r?.PERSON_NAME ?? '';
    const split = (full: string) => {
      const parts = full.trim().split(/\s+/).filter(Boolean);
      return {
        first: parts[0] ?? '',
        second: parts.slice(1).join(' ') || ''
      };
    };
    const derived = split(personName);

    return {
      id: Number(r?.id ?? r?.personId ?? r?.PERSON_ID ?? 0),
      personName,
      firstName: r?.firstName ?? r?.FIRST_NAME ?? derived.first,
      secondName: r?.lastName ?? r?.LAST_NAME ?? derived.second,
      organizationId: r?.organizationId ?? r?.ORGANIZATION_ID ?? r?.oraganizationId ?? null,
      organizationName: r?.organizationName ?? r?.ORGANIZATION_NAME ?? null,
      phone: r?.phone ?? r?.TELEPHONE ?? null,
      mobile: r?.phone2 ?? r?.PHONE2 ?? null,
      email: r?.email ?? r?.EMAIL ?? null,
      position: r?.position ?? r?.POSITION ?? null,
      comments: r?.feedback ?? r?.FEEDBACK ?? null,
      createdBy: r?.createdBy ?? r?.CREATED_BY ?? null,
      isGeneral: r?.isGeneral ?? r?.IS_GENERAL ?? null,
    };
  };

  onAdd(): void {
    this.form = {
      id: 0,
      personName: '',
      organizationName: '',
      organizationId: null,
      phone: '',
      email: '',
      position: '',
      // createdBy: 'crmAdmin',
      createdBy: 'crmAdmin',
      isGeneral: 'N'
    };
    this.orgSelectedAutoValue = null;   // <-- مهم
    this.editing = false;
    this.submitted = false;
    this.personDialog = true;
    this.isGeneralBool = (this.form?.isGeneral === 'Y');

  }

  onEdit(row: PersonDataTable): void {
    this.form = { ...row };
    this.editing = true;
    this.submitted = false;

    // لو الليست لسه ما اتحمّلتش، استناها ثم اعمل preselect
    if (!this.orgDropDownList().length) {
      this.loadOrgsList(() => this.preselectOrg(row));
    } else {
      this.preselectOrg(row);
    }

    this.personDialog = true;
  }

  private preselectOrg(row: PersonDataTable): void {
    const list = this.orgDropDownList();

    console.log('Preselecting org for:', row);
    console.log('Available orgs:', list);

    // Try to find by ID first, then by name
    this.orgSelectedAutoValue =
      list.find(o => row.organizationId && o.id === row.organizationId) ||
      list.find(o => row.organizationName && o.name === row.organizationName) ||
      null;

    console.log('Preselected org:', this.orgSelectedAutoValue);

    // ✅ Ensure form has the values too
    if (this.orgSelectedAutoValue) {
      this.form!.organizationId = this.orgSelectedAutoValue.id;
      this.form!.organizationName = this.orgSelectedAutoValue.name;
    }
  }



  hideDialog(): void {
    this.personDialog = false;
    this.orgSelectedAutoValue = null;
  }


  save(): void {
    this.submitted = true;

    const hasName =
      (this.form?.firstName?.trim() && this.form?.secondName?.trim()) ||
      this.form?.personName?.trim();
    if (!hasName) return;

    if (this.editing) {
      if (!this.form?.id) return;

      const toYN = (v: any) =>
        (v === true || v === 'Y') ? 'Y' :
          (v === false || v === 'N') ? 'N' : undefined;


      const fullName =
        [this.form.firstName, this.form.secondName].filter(Boolean).join(' ').trim();

      // ✅ Get organization from AutoComplete OR fallback to form values
      const selectedOrgId = this.orgSelectedAutoValue?.id ?? this.form.organizationId;
      const selectedOrgName = this.orgSelectedAutoValue?.name ?? this.form.organizationName;

      console.log('=== SAVE DEBUG ===');
      console.log('orgSelectedAutoValue:', this.orgSelectedAutoValue);
      console.log('form.organizationId:', this.form.organizationId);
      console.log('form.organizationName:', this.form.organizationName);
      console.log('Final selected ID:', selectedOrgId);
      console.log('Final selected Name:', selectedOrgName);

      const payload: PersonDto = {
        personId: this.form.id,
        firstName: this.form.firstName?.trim(),
        lastName: this.form.secondName?.trim(),
        personName: fullName || undefined,
        oraganizationId: selectedOrgId ?? undefined, // ✅ Use selected value
        email: this.form.email || undefined,
        phone: this.form.phone || undefined,
        phone2: this.form.mobile || undefined,
        position: this.form.position || undefined,
        feedback: this.form.comments?.trim() || undefined,
        isGeneral: toYN(this.form.isGeneral),
        modifiedBy: this.service['layout']?.getLoggedUser?.()?.username ?? 'CrmAdmin',
        userId: Number(this.service['layout']?.getLoggedUser?.()?.userId ?? 0)
      };

      console.log('Payload being sent:', payload);

      this.service.updatePerson([payload]).subscribe({
        next: (res: any) => {
          const updated = (Array.isArray(res?.data) ? res.data[0] : null) || payload;
          const idx = this.rows.findIndex(r => r.id === this.form!.id);
          const nextIsGeneral =
            (updated as any).isGeneral ?? payload.isGeneral ?? this.rows[idx].isGeneral;

          const nextFullName =
            (updated as any).personName
            ?? [(updated as any).firstName ?? payload.firstName,
            (updated as any).lastName ?? payload.lastName]
              .filter(Boolean).join(' ').trim();

          if (idx > -1) {
            this.rows[idx] = {
              ...this.rows[idx],
              personName: nextFullName,
              firstName: (updated as any).firstName ?? this.rows[idx].firstName,
              secondName: (updated as any).lastName ?? this.rows[idx].secondName,
              email: updated.email ?? this.rows[idx].email,
              phone: updated.phone ?? this.rows[idx].phone,
              mobile: updated.phone2 ?? this.rows[idx].mobile,
              position: updated.position ?? this.rows[idx].position,
              comments: (updated as any).feedback ?? this.rows[idx].comments,
              organizationId: selectedOrgId ?? this.rows[idx].organizationId,    // ✅
              organizationName: selectedOrgName ?? this.rows[idx].organizationName, // ✅
              isGeneral: nextIsGeneral,
            };
          }

          this.toast.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Person updated successfully'
          });
          this.personDialog = false;
          this.orgSelectedAutoValue = null; // ✅ Reset
        },
        error: (err) => {
          console.error('Update error:', err);
          this.toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: err?.message || 'Could not update person'
          });
        }
      });
    } else {
      // === CREATE MODE ===
      const toYN = (v: any) =>
        (v === true || v === 'Y') ? 'Y' :
          (v === false || v === 'N') ? 'N' : undefined;

      const fullName =
        this.form!.personName?.trim()
        || [this.form!.firstName, this.form!.secondName].filter(Boolean).join(' ').trim();

      const selectedOrgId = this.orgSelectedAutoValue?.id ?? this.form?.organizationId ?? undefined;
      const selectedOrgName = this.orgSelectedAutoValue?.name ?? this.form?.organizationName ?? undefined;

      const payload: PersonDto = {
        // personId: undefined  // اتركه فاضي عشان السيرفر ينشئه
        firstName: this.form!.firstName?.trim(),
        lastName: this.form!.secondName?.trim(),
        personName: fullName || undefined,
        oraganizationId: selectedOrgId,
        email: this.form!.email || undefined,
        phone: this.form!.phone || undefined,
        phone2: this.form!.mobile || undefined,
        position: this.form!.position || undefined,
        feedback: this.form!.comments?.trim() || undefined,
        isGeneral: toYN(this.form!.isGeneral),
        createdBy: this.service['layout']?.getLoggedUser?.()?.username ?? 'CrmAdmin',
        userId: Number(this.service['layout']?.getLoggedUser?.()?.userId ?? 0),
      };

      console.log("payloadBeforeCreation", payload);
      this.service.createPerson([payload]).subscribe({
        next: (res: any) => {
          const created = (Array.isArray(res?.data) ? res.data[0] : res?.data) || {};
          const newRow: PersonDataTable = {
            id: Number(created.personId ?? created.id),            // <- ID القادم من السيرفر
            personName: created.personName ?? fullName,
            firstName: created.firstName ?? payload.firstName ?? '',
            secondName: created.lastName ?? payload.lastName ?? '',
            organizationId: Number(created.oraganizationId ?? selectedOrgId ?? null),
            organizationName: created.organizationName ?? selectedOrgName ?? null,
            phone: created.phone ?? payload.phone ?? null,
            mobile: created.phone2 ?? payload.phone2 ?? null,
            email: created.email ?? payload.email ?? null,
            position: created.position ?? payload.position ?? null,
            comments: created.feedback ?? payload.feedback ?? null,
            createdBy: created.createdBy ?? 'crmAdmin',
            isGeneral: created.isGeneral ?? payload.isGeneral ?? null,
          };

          this.rows = [newRow, ...this.rows];
          this.toast.add({ severity: 'success', summary: 'Created', detail: 'Person created successfully' });
          this.personDialog = false;
          this.orgSelectedAutoValue = null;
        },
        error: (err) => {
          this.toast.add({ severity: 'error', summary: 'Create Failed', detail: err?.message || 'Could not create person' });
        }
      });
    }
  }

  failedRowId: number | null = null;

  delete(row: PersonDataTable): void {
    this.confirm.confirm({
      message: `Delete "${row.personName}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.deletePerson(row.id).subscribe({
          next: (res: any) => {
            const status = Number(res?.status);
            const deleted = res?.data?.[0]?.deletedCount ?? 0;

            if (status === 200 && deleted > 0) {
              // ✅ Successfully deleted
              this.rows = this.rows.filter(r => r.id !== row.id);
              this.toast.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Person removed successfully'
              });
            } else if (status === 422) {
              // ❌ Logical failure from API (constraint, foreign key, etc.)
              const dbError = res?.data?.[0]?.failures?.[0]?.reason || '';
              const isConstraintViolation = dbError.includes('ORA-02292');

              this.toast.add({
                severity: 'warn',
                summary: 'Delete Failed',
                detail: isConstraintViolation
                  ? 'This person cannot be deleted because it is linked to other records.'
                  : dbError, // fallback if different failure
                life: 8000
              });
            }
          },

          error: (err) => {
            // ❌ Unexpected or network error
            this.toast.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.message || 'Could not delete person.'
            });
          }
        });
      }
    });
  }

  highlightFailedRow(id: number) {
    this.failedRowId = id;
    setTimeout(() => this.failedRowId = null, 3000);
  }



  onOrgSelect(event: GenericIdName): void {
    console.log('Organization selected:', event);

    if (this.form) {
      this.form.organizationId = event.id;
      this.form.organizationName = event.name;
    }
  }

  onOrgClear(): void {
    console.log('Organization cleared');

    if (this.form) {
      this.form.organizationId = null;
      this.form.organizationName = null;
    }
  }


  // ===== Table helpers =====
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  exportCSV(): void {
    this.dt.exportCSV({ selectionOnly: false });
  }

  saving(): boolean {
    return false; // flip to true لو هتعمل مكالمة API فعلية للحفظ
  }

  onSimpleGeneralChange(e: Event): void {
    if (!this.form) return;
    const checked = (e.target as HTMLInputElement).checked;
    this.form.isGeneral = checked ? 'Y' : 'N';
  }



  showTransferDialog = false;

  salesGroups: any[] = [];
  usersOfGroup: any[] = [];

  selectedGroupId?: number;
  selectedTargetUserId?: number;

  personOfDataTransfer: PersonDataTable[] = []; // persons of the selected group

  // openTransferDialog() {
  //   this.showTransferDialog = true;
  //   const userId = Number(this.service['layout']?.getLoggedUser?.()?.userId);
  //   const salesRoleType = Number(this.service['layout']?.getLoggedUser?.()?.userRoleTypeId);

  //   this.service.getTransferContactsData(userId, salesRoleType).subscribe(res => {
  //     this.personOfDataTransfer = res.data ?? [];
  //   });

  //   this.service.getGroupOfUsers(userId).subscribe(res => {
  //     this.salesGroups = res.data ?? [];
  //   });
  // }


  openTransferDialog() {
  this.showTransferDialog = true;
  const userId = Number(this.service['layout']?.getLoggedUser?.()?.userId);
  const salesRoleType = Number(this.service['layout']?.getLoggedUser?.()?.userRoleTypeId);

  this.service.getTransferContactsData(userId, salesRoleType).subscribe(res => {
    const data: any[] = res.data ?? [];
    // ✅ FIX: Use your mapRow function here to correctly format the data
    this.personOfDataTransfer = data.map(this.mapRow);
  });

  this.service.getGroupOfUsers(userId).subscribe(res => {
    this.salesGroups = res.data ?? [];
  });
}

  // loadUsersOfGroup() {
  //   console.log("here in selectedGroupId>",this.selectedGroupId)
  //   if (!this.selectedGroupId) return;

  //   this.service.getAllUsersOfSalesGroup(this.selectedGroupId).subscribe(res => {
  //     this.usersOfGroup = res.data ?? [];
  //   });

  //   // this.personService.getPersonsByGroup(this.selectedGroupId).subscribe(res => {
  //   //   this.personOfDataTransfer = (res.data ?? []).map(p => ({ ...p, transferChecked: false }));
  //   // });
  // }


  loadGroupsOfUser() {


        console.log("here in selectedGroupId>",this.selectedGroupId)

    if (!this.selectedGroupId) return;

    // this.service.getAllUsersOfSalesGroup(this.selectedGroupId).subscribe(res => {
    //   this.usersOfGroup = res.data ?? [];
    // });

    const userId = Number(this.service['layout']?.getLoggedUser?.()?.userId);

    this.service.getGroupOfUsers(userId).subscribe(res => {
      this.salesGroups = res.data ?? [];


      if (!this.selectedGroup?.salesGroupId) return;

      const groupId = this.selectedGroup.salesGroupId;

      this.service.getAllUsersOfSalesGroup(groupId).subscribe(res => {
        this.usersOfGroup = res.data ?? [];
      });



    });

    // this.personService.getPersonsByGroup(this.selectedGroupId).subscribe(res => {
    //   this.personOfDataTransfer = (res.data ?? []).map(p => ({ ...p, transferChecked: false }));
    // });
  }

  // confirmTransferContacts() {
  //   const selectedPersons = this.personOfDataTransfer.filter(p => p.transferChecked);
  //   const targetUserId = this.selectedTargetUserId;

  //   console.log('Transfer these persons:', selectedPersons);
  //   console.log('To userId:', targetUserId);

  //   // 🔁 Call backend here to handle transfer logic
  //   this.showTransferDialog = false;
  // }

//   confirmTransferContacts() {
//   // 1. استخلاص البيانات: الأشخاص المختارون والمستخدم الهدف
//   const personsToTransfer = this.personOfDataTransfer.filter(p => p.transferChecked);
//   const targetUser = this.selectedTargetUser; // هذا هو كائن المستخدم الكامل الذي تم اختياره

//   // 2. التحقق من الاختيار
//   if (!targetUser?.id || personsToTransfer.length === 0) {
//     this.toast.add({
//       severity: 'warn',
//       summary: 'Incomplete Selection',
//       detail: 'Please select a target user and at least one contact to transfer.'
//     });
//     return;
//   }

//   const targetUserId = targetUser.id;
//   const loggedInUsername = this.service['layout']?.getLoggedUser?.()?.username ?? 'CrmAdmin';

//   // 3. تجهيز البيانات (Payload) لإرسالها لخدمة التحديث
//   // سنقوم بإنشاء مصفوفة من الكائنات، كل كائن يمثل تحديثًا لشخص واحد
//   const payload: PersonDto[] = personsToTransfer.map(person => {
//     // الأهم هو إرسال هوية الشخص وهوية المستخدم الجديد
//     return {
//       personId: person.id,      // هوية الشخص الذي سيتم نقله
//       userId: targetUserId,     // <-- أهم خطوة: تحديد المالك الجديد
//       modifiedBy: loggedInUsername // من الجيد تسجيل من قام بالتعديل
//       // ملاحظة: لا تحتاج لإرسال كل بيانات الشخص، فقط الحقول التي ستتغير
//       // بالإضافة إلى الـ personId. بعض الواجهات الخلفية قد تتطلب حقولاً أخرى.
//     };
//   });

//   console.log('Payload for transfer:', payload);

//   // 4. استدعاء خدمة التحديث
//   this.service.updatePerson(payload).subscribe({
//     next: (res) => {
//       this.toast.add({
//         severity: 'success',
//         summary: 'Transfer Complete',
//         detail: `${personsToTransfer.length} contact(s) transferred successfully to ${targetUser.name}.`
//       });
//       this.showTransferDialog = false; // أغلق النافذة
//       this.fetch(); // ✅ أعد تحميل بيانات الجدول الرئيسي لترى التغييرات
//     },
//     error: (err) => {
//       this.toast.add({
//         severity: 'error',
//         summary: 'Transfer Failed',
//         detail: err?.message || 'An unexpected error occurred.'
//       });
//     }
//   });
// }


confirmTransferContacts() {
  const personsToTransfer = this.personOfDataTransfer.filter(p => p.transferChecked);
  const targetUser = this.selectedTargetUser;

  if (!targetUser?.id || personsToTransfer.length === 0) {
    this.toast.add({
      severity: 'warn',
      summary: 'Incomplete Selection',
      detail: 'Please select a target user and at least one contact to transfer.'
    });
    return;
  }

  const targetUserId = targetUser.id;
  console.log("targetUserId>",targetUserId)
  const loggedInUsername = this.service['layout']?.getLoggedUser?.()?.username ?? 'CrmAdmin';

  // ✅ تعديل: سنرسل كل بيانات الشخص القديمة مع تعديل الـ userId فقط
 const payload: PersonDto[] = personsToTransfer.map(person => {
  return {
    // --- Data required by the Backend ---
    personId: person.id,
    firstName: person.firstName ?? undefined, // ✅ FIX
    lastName: person.secondName ?? undefined, // ✅ FIX

    // ✅ Correctly converted fields from your last fix
    oraganizationId: person.organizationId ?? undefined,
    phone: person.phone ?? undefined,
    phone2: person.mobile ?? undefined,
    email: person.email ?? undefined,
    position: person.position ?? undefined,
    feedback: person.comments ?? undefined,
    isGeneral: person.isGeneral ?? undefined,

    // --- Fields being actively changed ---
    userId: targetUserId,
    modifiedBy: loggedInUsername,
  };
});
  console.log('Full payload for transfer:', payload);

  // استدعاء الخدمة كالمعتاد
  this.service.updatePerson(payload).subscribe({
    next: (res) => {
      this.toast.add({
        severity: 'success', summary: 'Transfer Complete',
        detail: `${personsToTransfer.length} contact(s) transferred successfully to ${targetUser.name}.`
      });
      this.showTransferDialog = false;
      this.fetch();
    },
    error: (err) => {
      this.toast.add({
        severity: 'error', summary: 'Transfer Failed',
        detail: err?.message || 'An unexpected error occurred.'
      });
    }
  });
}
  // Full list from backend
  // Filtered suggestions
  filteredSalesGroups: any[] = [];
  filteredUsers: any[] = [];

  // Selected values (objects, not IDs)
  selectedGroup?: any;
  selectedTargetUser?: any;

  // 🔍 Filtering sales groups
  filterSalesGroups(event: any) {
    const query = event.query.toLowerCase();
    this.filteredSalesGroups = this.salesGroups.filter(group =>
      group.salesGroupName.toLowerCase().includes(query)
    );
  }


  filterUsers(event: any) {
  const query = event.query.toLowerCase();
  this.filteredUsers = this.usersOfGroup.filter(user =>
    // Check if user.name exists, default to empty string, then filter
    (user.name || '').toLowerCase().includes(query) // ✅ CORRECTED
  );
}


onGroupSelect(group: any) {
  // Now, 'group' is the selected object, e.g., { salesGroupId: 282, salesGroupName: 'P Systems Sales groupX' }
  console.log("Selected Group Object:", group);

  // This check will now work correctly
  if (!group?.salesGroupId) {
    this.usersOfGroup = []; // Clear previous users if the selection is invalid
    return;
  }

  // ✅ This API call will now be made with the correct ID
  this.service.getAllUsersOfSalesGroup(group.salesGroupId).subscribe(res => {
    this.usersOfGroup = res.data ?? [];
    this.filteredUsers = this.usersOfGroup; // Set suggestions for the user dropdown
    
    // IMPORTANT: Clear the previously selected user
    this.selectedTargetUser = null; 
  });
}


onGlobalFilter2(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Check if dt2 is available before filtering
    if (this.dt2) {
      this.dt2.filterGlobal(input.value, 'contains');
    }
  }





}









