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
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OrganizationsService } from '../../orgs.service';
import { OrgDataTable } from '../../model/org-data-table.type=model';
import { LoadingSpinnerComponent } from "@/common/components/loading-spinner.component";
import { GenericIdName } from '@/common/models/generic-id-name.model';
import { CommonRequestsService } from '@/common/services/common-requests.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { CreateOrgDto } from '../../model/create-org-dto.model';
import { UpdateOrgDto } from '../../model/update-org-dto.model';
// import { Dropdown } from 'primeng/dro';


@Component({
  selector: 'app-organizations-list',
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
    TextareaModule,
    IconFieldModule,
    InputIconModule,
    LoadingSpinnerComponent,
    AutoCompleteModule
  ],
  templateUrl: './orgs.component.html',
  providers: [MessageService, ConfirmationService]
})
export class OrgsComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private editOrgId: number | null = null;

  searchFilter = {
    industryId: null as number | null,
    organizationName: '',
    telephone1: '',
    telephone2: '',
    // countryName: '',
    // regionName: ''
    countryId: null as number | null,
    regionId: null as number | null,
  };

  // ===== Industry Autocomplete State =====
  industryDropDownList = signal<GenericIdName[]>([]);
  industryAutoFiltered: GenericIdName[] = [];
  industrySelectedAutoValue: GenericIdName | null = null;

  countryDropDownList = signal<GenericIdName[]>([]);
  countryAutoFiltered: GenericIdName[] = [];
  countrySelectedAutoValue: GenericIdName | null = null;


  regionDropDownList = signal<GenericIdName[]>([]);
  regionAutoFiltered: GenericIdName[] = [];
  regionSelectedAutoValue: GenericIdName | null = null;

  // applyFilters(): void {
  //   this.loading = true;
  //   console.log("Applying filters:", this.searchFilter);

  //   // IMPORTANT: You need a service method that accepts the filter object.
  //   // Let's assume you have one called `searchOrgs`.
  //   this.service.searchOrgs(this.searchFilter).subscribe({
  //     next: (res: any) => {
  //       const raw = Array.isArray(res?.data) ? res.data : [];
  //       this.rows = raw.map((item: any) => this.mapRow(item));
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       this.loading = false;
  //       this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to load organizations' });
  //     }
  //   });
  // }
  applyFilters(): void {
    this.loading = true;

    const filters: any = {
      organizationName: this.searchFilter.organizationName?.trim() || null,
      telephone1: this.searchFilter.telephone1?.trim() || null,
      telephone2: this.searchFilter.telephone2?.trim() || null,
      countryName: this.countrySelectedAutoValue?.id || null,
      regionName: this.regionSelectedAutoValue?.id || null,
      industryId: this.industrySelectedAutoValue?.id || null
    };

    console.log("filters>", filters);

    this.service.searchOrgs(filters).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res?.data) ? res.data : [];
        this.rows = raw.map((item: any) => this.mapRow(item));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to load organizations' });
      }
    });
  }

  clearFilters(): void {
    this.searchFilter = {
      industryId: null,
      organizationName: '',
      telephone1: '',
      telephone2: '',
      countryId: null,
      regionId: null
    };
    this.industrySelectedAutoValue = null;
    this.countrySelectedAutoValue = null;
    this.regionSelectedAutoValue = null;
    this.applyFilters();
  }

  // clearFilters(): void {
  //   this.searchFilter = {
  //     industryId: null,
  //     organizationName: '',
  //     telephone1: '',
  //     telephone2: '',
  //     countryName: '',
  //     regionName: ''
  //   };
  //   // Call applyFilters again to fetch all data
  //   this.applyFilters();
  // }


  // table state
  rows: OrgDataTable[] = [];
  loading = true;
  exportFileName = `organizations_${new Date().toISOString().slice(0, 10)}`;

  cols = [
    { field: 'organizationName', header: 'Organization Name' },
    { field: 'industryName', header: 'Industry' },
    { field: 'countryName', header: 'Country' },
    { field: 'regionName', header: 'Region' },
    { field: 'telephone1', header: 'Telephone 1' },
    { field: 'telephone2', header: 'Telephone 2' }
  ];

  // dialog state
  groupDialog = false;
  editing = false;
  submitted = false;
  form: Partial<OrgDataTable> | null = null;
  form2: Partial<CreateOrgDto> | null = null;
  form3: Partial<UpdateOrgDto> | null = null;



  constructor(
    private service: OrganizationsService,
    private commonRequestsService: CommonRequestsService, // Inject the common service
    private toast: MessageService,
    private confirm: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadIndustriesList(); // Load industries on init
    this.fetch();
    this.loadCountriesList();
    this.loadRegionsList();
    // this.applyFilters();

  }

  loadIndustriesList(done?: () => void): void {
    // Assuming a method like this exists to fetch all industries
    this.commonRequestsService.getIndustriesIdAndName().subscribe({
      next: (res: any) => {
        const rawData = res?.data ?? [];
        const mappedIndustries: GenericIdName[] = rawData.map((x: any) => ({
          id: Number(x?.id ?? 0),
          name: String(x?.name ?? '')
        })).filter((ind: GenericIdName) => ind.id && ind.name);

        this.industryDropDownList.set(mappedIndustries);
        done?.();
      },
      error: (err) => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Industries.' });
      }
    });
  }

  filterIndustryList(event: AutoCompleteCompleteEvent) {
    const query = (event.query || '').toLowerCase().trim();
    const list = this.industryDropDownList();
    this.industryAutoFiltered = !query ? list.slice(0, 50) : list.filter(x => x.name?.toLowerCase().includes(query));
  }

  private preselectIndustry(row: OrgDataTable): void {
    const list = this.industryDropDownList();
    this.industrySelectedAutoValue = list.find(ind => ind.name === row.industryName) || null;

    // Also update the form object
    if (this.industrySelectedAutoValue) {
      this.form!.industryName = this.industrySelectedAutoValue.name;
    }
  }

  // onIndustrySelect(event: GenericIdName): void {
  //   if (this.form) {
  //     this.form.industryName = event.name;
  //   }
  // }

  // onIndustryClear(): void {
  //   if (this.form) {
  //     this.form.industryName = null;
  //   }
  // }

  onIndustrySelect(event: GenericIdName): void {
    this.searchFilter.industryId = event?.id || null;
    if (this.form2) { this.form2.industryId = event.id; }

  }

  onIndustryClear(): void {
    this.industrySelectedAutoValue = null;
    this.searchFilter.industryId = null;
  }




  loadCountriesList(done?: () => void): void {
    // Assuming a method like this exists to fetch all industries
    this.commonRequestsService.getCountriesIdAndName().subscribe({
      next: (res: any) => {
        const rawData = res?.data ?? [];
        const mappedCountrues: GenericIdName[] = rawData.map((x: any) => ({
          id: Number(x?.id ?? 0),
          name: String(x?.name ?? '')
        })).filter((ind: GenericIdName) => ind.id && ind.name);

        this.countryDropDownList.set(mappedCountrues);
        done?.();
      },
      error: (err) => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Industries.' });
      }
    });
  }


  filterCountryList(event: AutoCompleteCompleteEvent) {
    const query = (event.query || '').toLowerCase().trim();
    this.countryAutoFiltered = this.countryDropDownList().filter(c => c.name?.toLowerCase().includes(query));
  }

  loadRegionsList(done?: () => void): void {
    this.commonRequestsService.getRegionsIdAndName().subscribe({
      next: (res: any) => {
        const rawData = res?.data ?? [];
        this.regionDropDownList.set(rawData.map((x: any) => ({ id: Number(x.id), name: String(x.name) })));
        done?.();
      },
      error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Regions.' })
    });
  }

  filterRegionList(event: AutoCompleteCompleteEvent) {
    const query = (event.query || '').toLowerCase().trim();
    this.regionAutoFiltered = this.regionDropDownList().filter(r => r.name?.toLowerCase().includes(query));
  }


  private preselectCountry(row: OrgDataTable): void {
    this.countrySelectedAutoValue = this.countryDropDownList().find(c => c.name === row.countryName) || null;
    if (this.countrySelectedAutoValue) this.form!.countryName = this.countrySelectedAutoValue.name;
  }

  // private preselectIndustry(row: OrgDataTable): void {
  //   const list = this.industryDropDownList();
  //   this.industrySelectedAutoValue = list.find(ind => ind.name === row.industryName) || null;

  //   // Also update the form object
  //   if (this.industrySelectedAutoValue) {
  //     this.form!.industryName = this.industrySelectedAutoValue.name;
  //   }
  // }

  private preselectRegion(row: OrgDataTable): void {
    this.regionSelectedAutoValue = this.regionDropDownList().find(r => r.name === row.regionName) || null;
    if (this.regionSelectedAutoValue) this.form!.regionName = this.regionSelectedAutoValue.name;
  }

  onCountrySelect(event: GenericIdName): void {
    if (this.form2) { this.form2.countryId = event.id; }
    this.searchFilter.countryId = event?.id || null;

  }
  onCountryClear(): void {
    // if (this.form) { this.form.countryName = null; }
    this.countrySelectedAutoValue = null;
    this.searchFilter.countryId = null;
  }

  onRegionSelect(event: GenericIdName): void {
    if (this.form2) { this.form2.regionId = event.id; }
    this.searchFilter.regionId = event?.id || null;
    // this.loadCountriesByRegion(this.searchFilter.regionId!);


  }
  onRegionClear(): void {
    // if (this.form) { this.form.regionName = null; }
    this.regionSelectedAutoValue = null;
    this.searchFilter.regionId = null;
    // this.countryDropDownList.set([]);  // اختياري: فضّي القائمة

  }

  //   loadCountriesByRegion(regionId: number): void {
  //   this.commonRequestsService.getCountriesIdAndName(regionId).subscribe({
  //     next: (res: any) => {
  //       const list = (res?.data ?? [])
  //         .map((x: any) => ({ id: Number(x.id), name: String(x.name) }))
  //         .filter((c: any) => c.id && c.name);
  //       this.countryDropDownList.set(list);
  //       this.countrySelectedAutoValue = null;    
  //       this.countryAutoFiltered = list;          
  //     },
  //     error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Countries.' })
  //   });
  // }


  // onIndustrySelect(event: GenericIdName): void {
  //   this.searchFilter.industryId = event?.id || null;
  // }

  // onIndustryClear(): void {
  //   this.industrySelectedAutoValue = null;
  //   this.searchFilter.industryId = null;
  // }






  // === GET with mapping from RAW ===
  fetch(): void {
    this.loading = true;
   
    this.industrySelectedAutoValue = null;
    this.countrySelectedAutoValue = null;
    this.regionSelectedAutoValue = null;
    this.service.getTableDataRaw().subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res?.data) ? res.data : [];
        this.rows = raw.map((item: any, idx: number) => this.mapRow(item));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to load' });
      }
    });
  }



  // toolbar actions
  onAddGroup(): void {
    this.editOrgId = null;

    this.form2 = {
      // orgId: 0,
      organizationName: '',
      industryId: null,
      countryId: null,
      regionId: null,
      telephone1: '',
      telephone2: ''
    };
    this.industrySelectedAutoValue = null; // Reset selection for new entry
    this.submitted = false;
    this.editing = false;
    this.groupDialog = true;

  }

  // onEditGroup(g: OrgDataTable): void {
  //   this.form = { ...g };
  //   this.submitted = false;
  //   this.editing = true;
  //   this.groupDialog = true;
  //   // Pre-select the industry for the organization being edited
  //   if (!this.industryDropDownList().length) {
  //     this.loadIndustriesList(() => this.preselectIndustry(g));
  //   } else {
  //     this.preselectIndustry(g);
  //   }
  // }


  onEditGroup(g: OrgDataTable): void {
    // keep a reference to the original id
    this.editOrgId = g.orgId;
    console.log("this.editOrgId", this.editOrgId);
    // this is what the dialog binds to
    this.form2 = {
      organizationName: g.organizationName || '',
      telephone1: g.telephone1 || '',
      telephone2: g.telephone2 || '',
      industryId: null,
      countryId: null,
      regionId: null,
    };

    this.submitted = false;
    this.editing = true;
    this.groupDialog = true;

    // Ensure all lists are loaded then hydrate selections
    const ensureAndHydrate = () => this.hydrateSelectionsFromRow(g);

    const needIndustry = !this.industryDropDownList().length;
    const needCountry = !this.countryDropDownList().length;
    const needRegion = !this.regionDropDownList().length;

    if (needIndustry) {
      this.loadIndustriesList(() => {
        if (needCountry) {
          this.loadCountriesList(() => {
            if (needRegion) this.loadRegionsList(ensureAndHydrate);
            else ensureAndHydrate();
          });
        } else if (needRegion) {
          this.loadRegionsList(ensureAndHydrate);
        } else {
          ensureAndHydrate();
        }
      });
    } else if (needCountry) {
      this.loadCountriesList(() => {
        if (needRegion) this.loadRegionsList(ensureAndHydrate);
        else ensureAndHydrate();
      });
    } else if (needRegion) {
      this.loadRegionsList(ensureAndHydrate);
    } else {
      ensureAndHydrate();
    }
  }

  private hydrateSelectionsFromRow(row: OrgDataTable): void {
    // Industry
    this.industrySelectedAutoValue =
      this.industryDropDownList().find(i => i.name === row.industryName) || null;
    if (this.form2) this.form2.industryId = this.industrySelectedAutoValue?.id ?? null;

    // Country
    this.countrySelectedAutoValue =
      this.countryDropDownList().find(c => c.name === row.countryName) || null;
    if (this.form2) this.form2.countryId = this.countrySelectedAutoValue?.id ?? null;

    // Region
    this.regionSelectedAutoValue =
      this.regionDropDownList().find(r => r.name === row.regionName) || null;
    if (this.form2) this.form2.regionId = this.regionSelectedAutoValue?.id ?? null;
  }

  hideGroupDialog(): void {
    this.groupDialog = false;
    this.editing = false;
    this.editOrgId = null;
    this.industrySelectedAutoValue = null;
    this.countrySelectedAutoValue = null;
    this.regionSelectedAutoValue = null;
  }


  saveGroupddd(): void {
    this.submitted = true;
    if (!this.form2?.organizationName?.trim()) return;

    // ✅ إنشاء جديد
    if (!this.editing) {
      const payload: CreateOrgDto = {
        organizationName: this.form2.organizationName!.trim(),
        industryId: this.form2.industryId ?? this.industrySelectedAutoValue?.id ?? null,
        countryId: this.form2.countryId ?? this.countrySelectedAutoValue?.id ?? null,
        regionId: this.form2.regionId ?? this.regionSelectedAutoValue?.id ?? null,
        telephone1: this.form2.telephone1?.trim() || null,
        telephone2: this.form2.telephone2?.trim() || null,
        createdBy: this.service['layout']?.getLoggedUser?.()?.username ?? ' ',
        createdOn: new Date().toISOString()

      };

      if (!payload.organizationName || payload.industryId == null || payload.countryId == null || payload.regionId == null) {
        this.toast.add({ severity: 'warn', summary: 'Missing data', detail: 'Please fill required fields.' });
        return;
      }

      console.log("here is my payload", payload);
      this.service.createOrg([payload]).subscribe({
        next: (res) => {
          const status = Number(res?.status);
          if (status === 200 || status === 207) {
            this.toast.add({ severity: 'success', summary: 'Created', detail: 'Organization added' });
            this.groupDialog = false;
            this.fetch();           // ✅ حمّل الجدول من السيرفر
          } else {
            this.toast.add({ severity: 'warn', summary: 'Not created', detail: res?.message || 'Validation failed' });
          }
        },
        error: (err) => {
          this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Create failed' });
        }
      });
      // this.industryAutoFiltered = [];
      // this.countryAutoFiltered = [];
      // this.regionAutoFiltered = [];
      this.industrySelectedAutoValue = null;
      this.countrySelectedAutoValue = null;
      this.regionSelectedAutoValue = null;
      return;
    }

    // ===== UPDATE =====
    if (this.editing && this.editOrgId != null) {
      const payload: UpdateOrgDto = {
        organizationId: this.editOrgId,
        organizationName: this.form2.organizationName!.trim(),
        industryId: this.form2.industryId ?? this.industrySelectedAutoValue?.id ?? null,
        countryId: this.form2.countryId ?? this.countrySelectedAutoValue?.id ?? null,
        regionId: this.form2.regionId ?? this.regionSelectedAutoValue?.id ?? null,
        telephone1: this.form2.telephone1?.trim() || null,
        telephone2: this.form2.telephone2?.trim() || null,
        modifiedBy: this.service['layout']?.getLoggedUser?.()?.username ?? ' ',
        modifiedOn: new Date().toISOString()
      };

      console.log("here in update payload>", payload);

      if (!payload.organizationName || payload.industryId == null || payload.countryId == null || payload.regionId == null) {
        this.toast.add({ severity: 'warn', summary: 'Missing data', detail: 'Please fill required fields.' });
        return;
      }

      this.service.updateOrg([payload]).subscribe({
        next: (res) => {
          const status = Number(res?.status);
          if (status === 200 || status === 207) {
            this.toast.add({ severity: 'success', summary: 'Updated', detail: 'Organization updated' });
            this.groupDialog = false;
            this.fetch();  // أسهل من مزامنة الصف يدويًا
          } else {
            this.toast.add({ severity: 'warn', summary: 'Not updated', detail: res?.message || 'Validation failed' });
          }
        },
        error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Update failed' })
      });

      // tidy up
      this.editing = false;
      this.editOrgId = null;
      this.industrySelectedAutoValue = null;
      this.countrySelectedAutoValue = null;
      this.regionSelectedAutoValue = null;
    }

  }



  saveGroup(): void {
    this.submitted = true;
    if (!this.form2?.organizationName?.trim()) return;

    const common = {
      organizationName: this.form2.organizationName!.trim(),
      industryId: this.form2.industryId ?? this.industrySelectedAutoValue?.id ?? null,
      countryId: this.form2.countryId ?? this.countrySelectedAutoValue?.id ?? null,
      regionId: this.form2.regionId ?? this.regionSelectedAutoValue?.id ?? null,
      telephone1: this.form2.telephone1?.trim() || null,
      telephone2: this.form2.telephone2?.trim() || null,
    };

    const requiredMissing = !common.organizationName || common.industryId == null || common.countryId == null || common.regionId == null;
    if (requiredMissing) {
      this.toast.add({ severity: 'warn', summary: 'Missing data', detail: 'Please fill required fields.' });
      return;
    }

    // ✅ UPDATE when we have an ID
    if (this.editOrgId != null) {
      const payload: UpdateOrgDto = {
        organizationId: this.editOrgId,
        ...common,
        modifiedBy: this.service['layout']?.getLoggedUser?.()?.username ?? ' ',
        modifiedOn: new Date().toISOString()
      };

      console.log('UPDATE payload>', payload, 'editing=', this.editing, 'editOrgId=', this.editOrgId);

      this.service.updateOrg([payload]).subscribe({
        next: (res: any) => {
          const status = Number(res?.status);
          if (status === 200 || status === 207) {
            this.toast.add({ severity: 'success', summary: 'Updated', detail: 'Organization updated' });
            this.groupDialog = false;
            this.fetch();
          } else {
            this.toast.add({ severity: 'warn', summary: 'Not updated', detail: res?.message || 'Validation failed' });
          }
        },
        error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Update failed' })
      });

    } else {
      // ➕ CREATE when no ID
      const payload: CreateOrgDto = {
        ...common,
        createdBy: this.service['layout']?.getLoggedUser?.()?.username ?? ' ',
        createdOn: new Date().toISOString()
      };

      console.log('CREATE payload>', payload, 'editing=', this.editing, 'editOrgId=', this.editOrgId);

      this.service.createOrg([payload]).subscribe({
        next: (res) => {
          const status = Number(res?.status);
          if (status === 200 || status === 207) {
            this.toast.add({ severity: 'success', summary: 'Created', detail: 'Organization added' });
            this.groupDialog = false;
            this.fetch();
          } else {
            this.toast.add({ severity: 'warn', summary: 'Not created', detail: res?.message || 'Validation failed' });
          }
        },
        error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Create failed' })
      });
    }

    // cleanup
    this.editing = false;
    this.editOrgId = null;
    // this.industrySelectedAutoValue = null;
    // this.countrySelectedAutoValue = null;
    // this.regionSelectedAutoValue = null;
  }

  deleteOrgTest(g: OrgDataTable): void {
    this.confirm.confirm({
      message: `Delete "${g.organizationName}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Local-only delete
        this.rows = this.rows.filter(r => r.orgId !== g.orgId);
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Organization removed' });
      }
    });
  }

  failedRowId: number | null = null;


  deleteOrg(row: OrgDataTable): void {
    console.log("here in deleteOrg ")
    console.log("row", row)
    console.log("=>>", row.orgId)
    this.confirm.confirm({
      message: `Delete "${row.organizationName}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.deleteOrg(row.orgId).subscribe({
          next: (res: any) => {
            const status = Number(res?.status);
            const deleted = res?.data?.[0]?.deletedCount ?? 0;

            if (status === 200) {
              // ✅ Successfully deleted
              this.rows = this.rows.filter(r => r.orgId !== row.orgId);
              this.toast.add({
                severity: 'success',
                summary: 'Deleted',
                detail: ' ' + row.organizationName + ' removed successfully'
              });
            } else if (status === 409) {
              console.log('here in 409')
              // ❌ Logical failure from API (constraint, foreign key, etc.)
              const dbError = res?.data?.[0]?.failures?.[0]?.reason || '';
              // const isConstraintViolation = dbError.includes('ORA-02292');

              this.toast.add({
                severity: 'warn',
                summary: 'Delete Failed',
                // detail: isConstraintViolation
                //   ? 'This person cannot be deleted because it is linked to other records.'
                //   : dbError, // fallback if different failure
                detail: 'Cannot delete: ' + row.organizationName + ' is associated with  data exists.',
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


  private mapRow(item: any): OrgDataTable {
    return {
      orgId: Number(
        item?.orgId ??
        item?.ORGANIZATION_ID ??
        item?.oraganizationId ?? // لو عندك الغلطة الإملائية
        0
      ),
      organizationName: item?.organizationName ?? '',
      industryName: item?.industryName ?? null,
      countryName: item?.countryName ?? null,
      regionName: item?.regionName ?? null,
      telephone1: item?.telephone1 ?? null,
      telephone2: item?.telephone2 ?? null,
    };
  }


  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  exportCSV(): void {
    this.dt.exportCSV({ selectionOnly: false });
  }

  saving(): boolean {
    return false; // flip to true أثناء حفظ حقيقي
  }
}
