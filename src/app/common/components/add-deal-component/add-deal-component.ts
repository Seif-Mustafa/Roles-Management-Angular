import { GenericIdName } from '@/common/models/generic-id-name.model';
import { ProductService } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { Component,  Input, OnInit,  signal } from '@angular/core';
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
import { AddDealService } from './add-deal.service';
import { SalesGroupDropDown } from '@/crm-pages/deals/models/sales-group-drop-down.model';
import { GenericResponse } from '@/common/models/generic.response.model';

@Component({
    selector: 'add-deal-dialog',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, TranslateModule, TabsModule, AutoCompleteModule, LoadingSpinnerComponent, ToastModule, TableModule, DialogModule, DatePicker, InputTextModule, TextareaModule, FieldsetModule, ProgressBarModule, SliderModule, SelectModule, MultiSelectModule, InputIconModule, IconFieldModule, DividerModule, TooltipModule, ConfirmDialogModule, RadioButtonModule],
    templateUrl: './add-deal-component.html', styles: [`
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
export class AddDealDialog implements OnInit {

    loading = signal<boolean>(true); // Add loading state

    @Input() showDealDialog: boolean = false;
    // @Output() showDealDialogChange = new EventEmitter<boolean>();

    dealTitle: string = '';
    dealCurrency: GenericIdName | null = null;
    dealValue: number = 0;
    dealCommitDate: Date | null = null;
    dealClosureDate: Date | null = null;
    dealDescription: string = '';

    currenciesDropDownList = signal<GenericIdName[]>([]);
    currenciesAutoFilteredValue: any[] = [];

    pipelinesSelectedAutoValue: GenericIdName | null = null;
    pipelinesDropDownList = signal<GenericIdName[]>([]);
    pipelinesAutoFilteredValue: any[] = [];

    stagesSelectedAutoValue: GenericIdName | null = null;
    stagesDropDownList = signal<GenericIdName[]>([]);
    stagesAutoFilteredValue: any[] = [];

    salesGroupSelectedAutoValue: SalesGroupDropDown | null = null;
    salesGroupsDropDownList = signal<SalesGroupDropDown[]>([]);
    salesGroupsAutoFilteredValue: any[] = [];

    usersSelectedAutoValue: GenericIdName | null = null;
    usersDropDownList = signal<GenericIdName[]>([]);
    usersAutoFilteredValue: any[] = [];


    dealSourceSelectedAutoValue: GenericIdName | null = null;
    dealSourceDropDownList = signal<GenericIdName[]>([]);
    dealSourceAutoFilteredValue: any[] = [];

    organizationsSelectedAutoValue: GenericIdName | null = null;
    organizationsDropDownList = signal<GenericIdName[]>([]);
    organizationsAutoFilteredValue: any[] = [];

    customersDropDownList: GenericIdName[] = [];
    multiselectSelectedCustomers!: GenericIdName[];

    productsDropDownList: GenericIdName[] = [];
    multiselectSelectedProducts!: GenericIdName[];

    servicesDropDownList: GenericIdName[] = [];
    multiselectSelectedServices!: GenericIdName[];
    constructor(
        private addDealService: AddDealService, private commonRequestsService: CommonRequestsService,
        private toastService: ToastService, private confirmationService: ConfirmationService, private translate: TranslateService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loading.set(true);
        forkJoin({
            getCurrencies: this.commonRequestsService.getCurrencyIdAndName(),
            pipelines: this.addDealService.getUserPipelines(),
            salesGroups: this.addDealService.getUserSalesGroups(),
            dealSources: this.commonRequestsService.getDealSourcesIdAndName(),
            organizations: this.commonRequestsService.getOrganizationIdAndName()
        }).subscribe({
            next: ({ getCurrencies, pipelines, salesGroups, dealSources, organizations }) => {
                this.currenciesDropDownList.set(getCurrencies.data || []);
                this.pipelinesDropDownList.set(pipelines.data || []);
                this.salesGroupsDropDownList.set(salesGroups.data || []);
                this.dealSourceDropDownList.set(dealSources.data || []);

                this.organizationsDropDownList.set(organizations.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                this.loading.set(false);
            }
        });
    }
    filterCurrencies(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const currency = this.currenciesDropDownList() || [];
        this.currenciesAutoFilteredValue = currency.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
    }

    onPipelineChange() {
        forkJoin({
            pipelineStages: this.addDealService.getPipelineStages(this.pipelinesSelectedAutoValue?.id || 0),
        }).subscribe({
            next: ({ pipelineStages }) => {
                this.stagesDropDownList.set(pipelineStages.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
            }
        });
    }

    filterPipelines(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const pipeline = this.pipelinesDropDownList() || [];
        this.pipelinesAutoFilteredValue = pipeline.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
    }

    onSalesGroupChange() {
        forkJoin({
            salesGroupUsers: this.addDealService.getSalesGroupUsers(this.salesGroupSelectedAutoValue?.salesGroupId || 0),
            products: this.addDealService.getProductsBySalesGroup(this.salesGroupSelectedAutoValue?.salesGroupId || 0),
            services: this.addDealService.getServicesBySalesGroup(this.salesGroupSelectedAutoValue?.salesGroupId || 0),
            // products: this.addDealService.getProductsBySalesGroup(362),
            // services: this.addDealService.getServicesBySalesGroup(362),
        }).subscribe({
            next: ({ salesGroupUsers, products, services }) => {
                this.usersDropDownList.set(salesGroupUsers.data || []);
                this.productsDropDownList = products.data || [];
                this.servicesDropDownList = services.data || [];
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {

            }
        });
    }

    onOrganizationChange() {
        forkJoin({
            customers: this.addDealService.getPersonsUnderOrganization(this.organizationsSelectedAutoValue?.id || 0),
        }).subscribe({
            next: ({ customers }) => {
                this.customersDropDownList = customers.data || [];
                // this.usersDropDownList.set(salesGroupUsers.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {

            }
        });
    }

    addDeal() {

        if (!this.validDealToAdd()) {
            return;
        }

        const dealPayload = {
            dealTitle: this.dealTitle,
            dealDesc: this.dealDescription,
            dealValue: this.dealValue,
            currencyId: this.dealCurrency?.id,
            personId: null, // As per your example, can be adjusted if needed
            pipelineStageId: this.stagesSelectedAutoValue?.id,
            salesUserId: this.usersSelectedAutoValue?.id,
            dealStatus: "I", // Default status
            commit: this.formatDate(this.dealCommitDate),
            dealSourceId: this.dealSourceSelectedAutoValue?.id,
            closuereDate: this.formatDate(this.dealClosureDate),
            wonDate: null,
            lostDate: null,
            orgId: this.organizationsSelectedAutoValue?.id,
            customerType: "I", // Default status
            dealType: "D", // Default status
            offeringDesc: null,
            salesGroupId: this.salesGroupSelectedAutoValue?.salesGroupId,
            services: this.multiselectSelectedServices?.map(service => ({
                serviceId: service.id,
                serviceCategoriesId: null
            })) || [],
            products: this.multiselectSelectedProducts?.map(product => ({
                productId: product.id,
                productCategoriesId: null
            })) || [],
            contacts: this.multiselectSelectedCustomers?.map(customer => ({
                personId: customer.id
            })) || []
        };

        this.loading.set(true);
        this.addDealService.postDeal(dealPayload).subscribe({
            next: (response: GenericResponse) => {

            },
            error: (error: any) => {
            },
            complete: () => {
                this.toastService.success("common.success", "common.deal_added_successfully");
                this.hideDialog();
                this.loading.set(false);
            }
        });

    }

    validDealToAdd(): boolean {
        // if (this.dealDialog.title === undefined || this.dealDialog.title === null || this.dealDialog.title === '') {
        //     this.toastService.error("common.error", "deals.deal_title_is_required");
        //     return false;
        // }
        // else if (this.dealDialog.currency === undefined || this.dealDialog.currency === null) {
        //     this.toastService.error("common.error", "deals.deal_currency_is_required");
        //     return false;
        // } else if (this.dealDialog.dealValue === undefined || this.dealDialog.dealValue === null) {
        //     this.toastService.error("common.error", "deals.deal_value_is_required");
        //     return false;
        // } else if (this.dealDialog.commitDate === undefined || this.dealDialog.commitDate === null) {
        //     this.toastService.error("common.error", "deals.commit_date_is_required");
        //     return false;
        // } else if (this.dealDialog.closureDate === undefined || this.dealDialog.closureDate === null) {
        //     this.toastService.error("common.error", "deals.closure_date_is_required");
        //     return false;
        // }
        return true;
    }

    private formatDate(date: Date | null): string | null {
        if (!date) {
            return null;
        }
        const d = new Date(date);
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return [d.getFullYear(), month, day].join('-');
    }

    hideDialog() {
        this.showDealDialog = false;
    }

    filterSalesGroups(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const salesGroup = this.salesGroupsDropDownList() || [];
        this.salesGroupsAutoFilteredValue = salesGroup.filter(
            v => v?.salesGroupName && v.salesGroupName.toLowerCase().startsWith(query)
        );
    }


    filterSalesUsers(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const salesUser = this.usersDropDownList() || [];
        this.usersAutoFilteredValue = salesUser.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
    }



    filterStages(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const stage = this.stagesDropDownList() || [];
        this.stagesAutoFilteredValue = stage.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
    }

    filterUsers(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        // const users = this.usersDropDownList() || [];
        // this.usersAutoFilteredValue = users.filter(
        //     v => v?.name && v.name.toLowerCase().startsWith(query)
        // );
    }

    filterDealSources(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const dealSource = this.dealSourceDropDownList() || [];
        this.dealSourceAutoFilteredValue = dealSource.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
    }


    filterOrganizations(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const organization = this.organizationsDropDownList() || [];
        this.organizationsAutoFilteredValue = organization.filter(
            v => v?.name && v.name.toLowerCase().startsWith(query)
        );
    }
    onAddService() {
    }
    onEditService() {

    }
    onDeleteService() {
    }


}
