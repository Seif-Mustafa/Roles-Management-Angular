import { GenericIdName } from '@/common/models/generic-id-name.model';
import { ProductService } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

import { CommonRequestsService } from '@/common/services/common-requests.service';
import { ConfirmationService } from 'primeng/api';
import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { CustomerService } from '@/pages/service/customer.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ToastService } from '@/common/services/toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AddDealService } from './add-activity.service';
import { SalesGroupDropDown } from '@/crm-pages/deals/models/sales-group-drop-down.model';
import { Activity } from '@/crm-pages/activities/models/activity.model';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'add-edit-activity-dialog',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, TranslateModule, TabsModule, AutoCompleteModule, LoadingSpinnerComponent, ToastModule, TableModule, DialogModule, DatePicker, InputTextModule, TextareaModule, FieldsetModule, ProgressBarModule, SliderModule, SelectModule, MultiSelectModule, InputIconModule, IconFieldModule, DividerModule, TooltipModule, ConfirmDialogModule, RadioButtonModule, CheckboxModule],
    templateUrl: './add-activity-component.html', styles: [`
        :host ::ng-deep .multiselect-wrap .p-multiselect-label {
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        :host ::ng-deep .multiselect-wrap.p-multiselect {
            height: auto;
            min-height: 3rem;
        }
    `],
    providers: [ProductService, CustomerService, ToastService, ConfirmationService]
})
export class AddEditActivityDialog implements OnInit {

    loading = signal<boolean>(true); // Add loading state

    @Input() showActivityDialog: boolean = false;

    activity!: Activity;

    selectedPerson: GenericIdName | null = null;

    selectedDeal: GenericIdName | null = null;
    selectedOrganization: GenericIdName | null = null;


    organizationSelectedAutoValue: any; // Add the missing property
    organizationsDropDownList = signal<GenericIdName[]>([]);
    organizationsAutoFilteredValue: any[] = [];


    dealSelectedAutoValue: any; // Add the missing property
    dealsAutoFilteredValue: any[] = [];
    dealsDropDownList = signal<GenericIdName[]>([]);

    personSelectedAutoValue: any; // Add the missing property
    personsAutoFilteredValue: any[] = [];
    personsDropDownList = signal<GenericIdName[]>([]);

    userSelectedAutoValue: any; // Add the missing property
    usersAutoFilteredValue: any[] = [];
    usersDropDownList = signal<GenericIdName[]>([]);

    constructor(
        private commonRequestsService: CommonRequestsService,
        private toastService: ToastService, private confirmationService: ConfirmationService, private translate: TranslateService,

    ) { }

    ngOnInit() {
        this.loading.set(false);
        forkJoin({
            // getCurrencies: this.commonRequestsService.getCurrencyIdAndName(),
            // pipelines: this.addDealService.getUserPipelines(),
            // salesGroups: this.addDealService.getUserSalesGroups(),
            // dealSources: this.commonRequestsService.getDealSourcesIdAndName(),
            // organizations: this.commonRequestsService.getOrganizationIdAndName()
        }).subscribe({
            // next: ({ getCurrencies, pipelines, salesGroups, dealSources, organizations }) => {
            //     this.currenciesDropDownList.set(getCurrencies.data || []);
            //     this.pipelinesDropDownList.set(pipelines.data || []);
            //     this.salesGroupsDropDownList.set(salesGroups.data || []);
            //     this.dealSourceDropDownList.set(dealSources.data || []);

            //     this.organizationsDropDownList.set(organizations.data || []);
            // },
            // error: () => {
            //     this.toastService.error("common.error", "common.failed_to_load_data");
            // }, complete: () => {
            //     this.loading.set(false);
            //     console.log("complete ");
            // }
        });

    }

    onObjectClear() {
        this.activity.objectId = undefined;
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
    filterUsers(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const users = this.usersDropDownList() || [];
        this.usersAutoFilteredValue = users.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
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


    saveActivity() { }


    hideDialog() {
    }
}
