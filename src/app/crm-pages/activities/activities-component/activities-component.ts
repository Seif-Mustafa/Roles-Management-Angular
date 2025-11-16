import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableLazyLoadEvent } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { ActivitiesService } from '../activities.service';
import { Activity } from '../models/activity.model';
import { Tooltip } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { MessageModule } from 'primeng/message';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { GenericIdName } from '@/common/models/generic-id-name.model';
import { DatePicker } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { forkJoin } from 'rxjs';
import { ToastService } from '@/common/services/toast.service';


@Component({
  selector: 'app-activities-component',
  standalone: true,
  imports: [CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    TranslateModule,
    Tooltip,
    TagModule,
    LoadingSpinnerComponent,
    MessageModule,
    AutoCompleteModule,
    DatePicker,
    CheckboxModule
  ],
  templateUrl: './activities-component.html',
  providers: [ConfirmationService, DatePipe, ToastService]
})
export class ActivitiesComponent implements OnInit {
  loading = signal<boolean>(true); // Add loading state
  submitted: boolean = false;
  tableRowsCount = signal<number>(10);

  activities = signal<Activity[]>([]);
  totalRecords = signal<number>(0);

  userSelectedAutoValue: any; // Add the missing property
  organizationSelectedAutoValue: any; // Add the missing property
  personSelectedAutoValue: any; // Add the missing property
  dealSelectedAutoValue: any; // Add the missing property
  usersAutoFilteredValue: any[] = [];
  organizationsAutoFilteredValue: any[] = [];
  personsAutoFilteredValue: any[] = [];
  dealsAutoFilteredValue: any[] = [];
  usersDropDownList = signal<GenericIdName[]>([]);
  organizationsDropDownList = signal<GenericIdName[]>([]);
  personsDropDownList = signal<GenericIdName[]>([]);
  dealsDropDownList = signal<GenericIdName[]>([]);
  activityDialog: boolean = false;
  activity!: Activity;
  // Properties for linked object autocompletes
  selectedPerson: GenericIdName | null = null;
  selectedDeal: GenericIdName | null = null;
  selectedOrganization: GenericIdName | null = null;

  selectedActivityType?: number;
  selectedInterval?: number;
  selectedUser?: GenericIdName;
  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private activitiesService: ActivitiesService,
    private toastService: ToastService,
    private datePipe: DatePipe
  ) { }


  ngOnInit() {
    this.loading.set(true);

    // The loadActivities method will be triggered by the table's onLazyLoad event initially
    // this.loadActivities({ first: 0, rows: 5 } as TableLazyLoadEvent); // Initial load
    forkJoin({
      users: this.activitiesService.getUsers(),
      organizations: this.activitiesService.getAllOrganizationsIdAndName(),
      persons: this.activitiesService.getAllPersonsIdAndName(),
      deals: this.activitiesService.getAllDealsIdAndName()
    }).subscribe({
      next: ({ users, organizations, persons, deals }) => {
        this.usersDropDownList.set(users.data || []);
        this.organizationsDropDownList.set(organizations.data || []);
        this.personsDropDownList.set(persons.data || []);
        this.dealsDropDownList.set(deals.data || []);
      },
      error: () => {
        this.toastService.error("common.error", "common.failed_to_load_data");
      }, complete: () => {
        this.loading.set(false);
      }
    });
  }

  private getDateRange(interval?: number): { dateFrom?: string, dateTo?: string } {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const formatDate = (date: Date) => this.datePipe.transform(date, 'yyyy-MM-dd') ?? undefined;

    switch (interval) {
      case 1: // Today
        return { dateFrom: formatDate(today), dateTo: formatDate(today) };
      case 2: // Tomorrow
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        return { dateFrom: formatDate(tomorrow), dateTo: formatDate(tomorrow) };
      case 3: // This week
        const firstDayOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        firstDayOfWeek.setDate(diff);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);
        return { dateFrom: formatDate(firstDayOfWeek), dateTo: formatDate(lastDayOfWeek) };
      case 4: // Next week
        const firstDayOfNextWeek = new Date(today);
        firstDayOfNextWeek.setDate(today.getDate() - today.getDay() + 8);
        const lastDayOfNextWeek = new Date(firstDayOfNextWeek);
        lastDayOfNextWeek.setDate(firstDayOfNextWeek.getDate() + 6);
        lastDayOfNextWeek.setHours(23, 59, 59, 999);
        return { dateFrom: formatDate(firstDayOfNextWeek), dateTo: formatDate(lastDayOfNextWeek) };
      case 5: // Overdue
        return { dateFrom: undefined, dateTo: formatDate(today) }; // Activities due before today
      case 6: // Done - This might be a status filter, handled separately if needed.
        // For now, we assume it's not a date range.
        return { dateFrom: undefined, dateTo: undefined };
      default: // All
        return { dateFrom: undefined, dateTo: undefined };
    }
  }

  loadActivities(event: TableLazyLoadEvent) {
    this.loading.set(true);

    const page = (event.first || 0) / (event.rows || 5);
    const rows = event.rows ?? 5;
    this.tableRowsCount.set(rows);

    const { dateFrom, dateTo } = this.getDateRange(this.selectedInterval);

    this.activitiesService.getAllActivitiesPagination(page, rows, this.selectedActivityType, this.selectedUser, dateFrom, dateTo, this.selectedInterval === 5, this.selectedInterval === 6).subscribe({
      next: (res) => {
        if (res && res.data) {

          this.activities.set(res.data ?? []);
          this.totalRecords.set(res.totalElements ?? 0);
        }
      },
      error: (err) => {
        this.toastService.error("common.error", "common.failed_to_load_data");
      },
      complete: () => {
        this.loading.set(false);

      },
    });
  }

  openNew() {
    this.activity = {
      "subject": "",
      "notes": "",
      "status": "I", // I / D
      "activityTypeId": 1, // 1 = call / 2 = meeting / 3 = task
      "objectType": "O", // O / P / D
      "activityTypeCode": "C" // C / M / T
    };
    this.selectedPerson = null;
    this.selectedDeal = null;
    this.selectedOrganization = null;

    this.submitted = false;
    this.activityDialog = true;
  }
  editActivity(activity: Activity) {
    this.activity = { ...activity, dueDate: new Date(activity.dueDate!) };
    this.selectedPerson = null;
    this.selectedDeal = null;
    this.selectedOrganization = null;
    this.activity.assignee = {
      id: activity.assignee!,
      name: activity.assigneeName!
    } as GenericIdName;
    if (activity.objectType === 'P') {
      this.selectedPerson = { id: activity.objectId!, name: activity.objectName };
    } else if (activity.objectType === 'D') {
      this.selectedDeal = { id: activity.objectId!, name: activity.objectName };
    } else if (activity.objectType === 'O') {
      this.selectedOrganization = { id: activity.objectId!, name: activity.objectName };
    }
    this.submitted = false;
    this.activityDialog = true;
  }

  filterActivityType(activityTypeId?: number) {
    this.selectedActivityType = activityTypeId;
    if (this.dt) {
      this.dt.first = 0;
    }
    this.loadActivities({ first: 0, rows: this.dt?.rows || 5 } as TableLazyLoadEvent);
  }

  filterSelectedInterval(selectedInterval?: number) {
    this.selectedInterval = selectedInterval;
    if (this.dt) {
      this.dt.first = 0;
    }
    this.loadActivities({ first: 0, rows: this.dt?.rows || 5 } as TableLazyLoadEvent);
  }

  filterUserActivities() {
    if (this.dt) {
      this.dt.first = 0;
    }
    this.loadActivities({ first: 0, rows: this.dt?.rows || 5 } as TableLazyLoadEvent);
  }

  resetFilters() {
    this.selectedUser = undefined;
    this.selectedActivityType = undefined;
    this.selectedInterval = undefined;
    this.filterUserActivities();
  }

  filterUsers(event: AutoCompleteCompleteEvent) {
    const query = event.query?.toLowerCase() || '';
    const users = this.usersDropDownList() || [];
    this.usersAutoFilteredValue = users.filter(
      v => v?.name && v.name.toLowerCase().startsWith(query)
    );
  }

  filterOrganizations(event: AutoCompleteCompleteEvent) {
    const query = event.query?.toLowerCase() || '';
    const organizations = this.organizationsDropDownList() || [];
    this.organizationsAutoFilteredValue = organizations.filter(
      v => v?.name && v.name.toLowerCase().startsWith(query)
    );
  }

  filterDeals(event: AutoCompleteCompleteEvent) {
    const query = event.query?.toLowerCase() || '';
    const deals = this.dealsDropDownList() || [];
    this.dealsAutoFilteredValue = deals.filter(
      v => v?.name && v.name.toLowerCase().startsWith(query)
    );
  }

  filterPersons(event: AutoCompleteCompleteEvent) {
    const query = event.query?.toLowerCase() || '';
    const persons = this.personsDropDownList() || [];
    this.personsAutoFilteredValue = persons.filter(
      v => v?.name && v.name.toLowerCase().startsWith(query)
    );
  }
  hideDialog() {
    this.activityDialog = false;
    this.submitted = false;
  }



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

  onObjectSelect(value: GenericIdName, type: 'P' | 'D' | 'O') {
    this.activity.objectId = value.id;
    this.activity.objectType = type;
    if (type === 'P') {
      this.selectedDeal = null;
      this.selectedOrganization = null;
    } else if (type === 'D') {
      this.selectedPerson = null;
      this.selectedOrganization = null;
    } else if (type === 'O') {
      this.selectedPerson = null;
      this.selectedDeal = null;
    }
  }

  onObjectClear() {
    this.activity.objectId = undefined;
  }


  saveActivity() {
    this.submitted = true;

    if (this.activity.subject.length === 0) {
      this.toastService.error('common.error', 'activities.subject_is_required');
      return;
    } else if (this.activity.dueDate === undefined) {
      this.toastService.error('common.error', 'activities.due_date_is_required');
      return;
    } else if (this.activity.assignee === undefined || this.activity.assignee === null) {
      this.toastService.error('common.error', 'activities.assignee_is_required');
      return;
    } else if (this.selectedPerson == null && this.selectedDeal == null && this.selectedOrganization == null) {
      this.toastService.error('common.error', 'activities.linked_object_is_required');
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

    const payload: Activity = {
      ...this.activity,
      assignee: assigneeId,
      dueDate: formattedDueDate
    };


    this.loading.set(true);

    if (!this.activity.activityId) {
      this.activitiesService.createActivity(payload).subscribe({
        next: (response) => {
          this.toastService.success('common.success', 'activities.activity_created_successfully');
        }, error: (error) => {
          this.toastService.error('common.error', 'activities.failed_to_create_activity');
        }, complete: () => {
          this.loading.set(false);
          this.activityDialog = false;
          this.loadActivities({ first: 0, rows: this.tableRowsCount() } as TableLazyLoadEvent);
        }
      });
    } else {
      this.activitiesService.updateActivity(payload).subscribe({
        next: (response) => {
          this.toastService.success('common.success', 'activities.activity_updated_successfully');
        }, error: (error) => {
          this.toastService.error('common.error', 'activities.failed_to_update_activity');
        }, complete: () => {
          this.loading.set(false);
          this.activityDialog = false;
          this.loadActivities({ first: 0, rows: this.tableRowsCount() } as TableLazyLoadEvent);
        }
      });
    }
  }
}
