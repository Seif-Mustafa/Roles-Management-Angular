import { GenericIdName } from '@/common/models/generic-id-name.model';
import { Product, ProductService } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
import { DealsService } from '../deals.service';
import { forkJoin } from 'rxjs';
import { SalesGroupDropDown } from '../models/sales-group-drop-down.model';
import { PipelineSummary } from '../models/pipeline-smmary.model';
import { CommonRequestsService } from '@/common/services/common-requests.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { ToastModule } from 'primeng/toast';
import { SalesDeal } from '../models/sales-deal.model';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { addDeal } from '../models/add-deal.model';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { Customer, CustomerService } from '@/pages/service/customer.service';
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
import { AddDealDialog } from '@/common/components/add-deal-component/add-deal-component';

@Component({
    selector: 'app-deals-component',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, TranslateModule, TabsModule, AutoCompleteModule, LoadingSpinnerComponent, ToastModule, TableModule, DialogModule, DatePicker, InputTextModule, TextareaModule, FieldsetModule, ProgressBarModule, SliderModule, SelectModule, MultiSelectModule, InputIconModule, IconFieldModule, DividerModule, TooltipModule, ConfirmDialogModule, RadioButtonModule, AddDealDialog],
    templateUrl: './deals-component.html',
    styles: `
        ::ng-deep {
            .p-orderlist-list-container {
                width: 100%;
            }
        }
    `,
    providers: [ProductService, CustomerService, ToastService, ConfirmationService]
})
export class DealsComponent implements OnInit {

    salesGroupSelectedAutoValue: SalesGroupDropDown | null = null; // Add the missing property
    salesGroupsDropDownList = signal<SalesGroupDropDown[]>([]);
    salesGroupsAutoFilteredValue: any[] = [];

    currenciesSelectedAutoValue: GenericIdName | null = null; // Add the missing property
    currenciesDropDownList = signal<GenericIdName[]>([]);
    currenciesAutoFilteredValue: any[] = [];

    usersSelectedAutoValue: GenericIdName | null = null; // Add the missing property
    usersDropDownList = signal<GenericIdName[]>([]);
    usersAutoFilteredValue: any[] = [];

    pipelineSummary: PipelineSummary = { pipelineId: 0, pipelineTitle: '', winCount: 0, loseCount: 0, inProgressCount: 0, offering: 0, rotten: 0, dealsAmount: 0 };
    pipelineStages: GenericIdName[] = [];

    loading = signal<boolean>(true); // Add loading state
    loadDeals = signal<boolean>(false); // Add loading state for deals

    selectedStage: GenericIdName | null = null;
    selectedDeal: SalesDeal | null = null;


    stageDeals = signal<SalesDeal[]>([]);

    layout: 'list' | 'grid' = 'grid';

    options = ['list', 'grid'];

    showDealDialog: boolean = false;
    showDeleteDealDialog: boolean = false;
    showWinDealDialog: boolean = false;
    showLoseDealDialog: boolean = false;

    dealDialog: addDeal = {};


    products: Product[] = [];
    customers1: Customer[] = [];

    loseDealRadioValue: any = null;

    lostReasons: GenericIdName[] = [];

    constructor(private productService: ProductService, private customerService: CustomerService,
        private dealsService: DealsService, private commonRequestsService: CommonRequestsService,
        private toastService: ToastService, private confirmationService: ConfirmationService, private translate: TranslateService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loading.set(true);

        forkJoin({
            salesGroups: this.dealsService.getUserSalesGroups(),
            getCurrencies: this.commonRequestsService.getCurrencyIdAndName(),

        }).subscribe({
            next: ({ salesGroups, getCurrencies }) => {
                this.salesGroupsDropDownList.set(salesGroups.data || []);
                this.currenciesDropDownList.set(getCurrencies.data || []);

                this.salesGroupSelectedAutoValue = this.salesGroupsDropDownList()[0] || null;
                this.currenciesSelectedAutoValue = this.currenciesDropDownList()[0] || null;
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                forkJoin({
                    pipelineSummary: this.dealsService.getPipelineSummaryByPipelineId(this.salesGroupSelectedAutoValue?.pipelineId || 0, this.salesGroupSelectedAutoValue?.salesGroupId || 0),
                    pipelineStages: this.dealsService.getPipelineStages(this.salesGroupSelectedAutoValue?.pipelineId || 0),
                    users: this.dealsService.getSalesGroupUsers(this.salesGroupSelectedAutoValue?.salesGroupId || 0)
                }).subscribe({
                    next: ({ pipelineSummary, pipelineStages, users }) => {
                        this.pipelineSummary = pipelineSummary.data[0] || null;
                        this.pipelineStages = pipelineStages.data || [];
                        this.selectedStage = this.pipelineStages[0];
                        this.usersDropDownList.set(users.data || []);
                    },
                    error: () => {
                        this.toastService.error("common.error", "common.failed_to_load_data");
                    }, complete: () => {
                        forkJoin({
                            stageDeals: this.dealsService.getDealsUnderStage(this.salesGroupSelectedAutoValue?.salesGroupId || 0, this.pipelineStages[0]?.id || 0, this.currenciesDropDownList()[0]?.id || 1)
                        }).subscribe({
                            next: ({ stageDeals }) => {
                                this.stageDeals.set(stageDeals.data || []);
                            },
                            error: () => {
                                this.toastService.error("common.error", "common.failed_to_load_data");
                            }, complete: () => {
                                this.toastService.warn("common.warning", "common.this_page_is_still_under_development");

                                this.loading.set(false);
                            }
                        });
                    }
                });
            }
        });

        this.productService.getProductsSmall().then((data) => (this.products = data));

        this.customerService.getCustomersLarge().then((customers) => {
            this.customers1 = customers;

            // @ts-ignore
            this.customers1.forEach((customer) => (customer.date = new Date(customer.date)));
        });
    }



    onCurrencyChange() {
        this.loadDeals.set(true);
        forkJoin({
            stageDeals: this.dealsService.getDealsUnderStage(this.salesGroupSelectedAutoValue?.salesGroupId || 0, this.selectedStage?.id || 0, this.currenciesSelectedAutoValue?.id || 1)
        }).subscribe({
            next: ({ stageDeals }) => {
                this.stageDeals.set(stageDeals.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                this.loadDeals.set(false);
            }
        });
    }

    onSalesGroupChange() {
        this.loadDeals.set(true);
        forkJoin({
            pipelineSummary: this.dealsService.getPipelineSummaryByPipelineId(this.salesGroupSelectedAutoValue?.pipelineId || 0, this.salesGroupSelectedAutoValue?.salesGroupId || 0),
            pipelineStages: this.dealsService.getPipelineStages(this.salesGroupSelectedAutoValue?.pipelineId || 0),
            users: this.dealsService.getSalesGroupUsers(this.salesGroupSelectedAutoValue?.salesGroupId || 0)
        }).subscribe({
            next: ({ pipelineSummary, pipelineStages, users }) => {
                if (pipelineSummary.data.length > 0) {
                    this.pipelineSummary = pipelineSummary.data[0] || null;
                } else {
                    this.pipelineSummary = {
                        dealsAmount: 0,
                        inProgressCount: 0,
                        loseCount: 0,
                        offering: 0,
                        pipelineId: 0,
                        pipelineTitle: '',
                        rotten: 0,
                        winCount: 0
                    };
                }
                this.pipelineStages = pipelineStages.data || [];
                this.selectedStage = this.pipelineStages[0];
                this.usersDropDownList.set(users.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                forkJoin({
                    stageDeals: this.dealsService.getDealsUnderStage(this.salesGroupSelectedAutoValue?.salesGroupId || 0, this.pipelineStages[0]?.id || 0, this.currenciesSelectedAutoValue?.id || 1)
                }).subscribe({
                    next: ({ stageDeals }) => {
                        this.stageDeals.set(stageDeals.data || []);
                    },
                    error: () => {
                        this.toastService.error("common.error", "common.failed_to_load_data");
                    }, complete: () => {
                        this.loadDeals.set(false);
                    }
                });
            }
        });
    }

    onUserChange() {
        this.loadDeals.set(true);
        forkJoin({
            pipelineSummary: this.dealsService.getPipelineSummaryByPipelineId(this.salesGroupSelectedAutoValue?.pipelineId || 0, this.salesGroupSelectedAutoValue?.salesGroupId || 0),
            pipelineStages: this.dealsService.getPipelineStages(this.salesGroupSelectedAutoValue?.pipelineId || 0),
            users: this.dealsService.getSalesGroupUsers(this.salesGroupSelectedAutoValue?.salesGroupId || 0)
        }).subscribe({
            next: ({ pipelineSummary, pipelineStages, users }) => {
                if (pipelineSummary.data.length > 0) {
                    this.pipelineSummary = pipelineSummary.data[0] || null;
                }
                this.pipelineStages = pipelineStages.data || [];
                this.selectedStage = this.pipelineStages[0];
                this.usersDropDownList.set(users.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                forkJoin({
                    stageDeals: this.dealsService.getDealsUnderStage(this.salesGroupSelectedAutoValue?.salesGroupId || 0, this.pipelineStages[0]?.id || 0, this.currenciesSelectedAutoValue?.id || 1, this.usersSelectedAutoValue?.id)
                }).subscribe({
                    next: ({ stageDeals }) => {
                        this.stageDeals.set(stageDeals.data || []);
                    },
                    error: () => {
                        this.toastService.error("common.error", "common.failed_to_load_data");
                    }, complete: () => {
                        this.loadDeals.set(false);
                    }
                });
            }
        });
    }


    onStageChange(stageId: number) {
        this.loadDeals.set(true);
        this.selectedStage = this.pipelineStages.find(stage => stage.id === stageId) || null;
        forkJoin({
            stageDeals: this.dealsService.getDealsUnderStage(this.salesGroupSelectedAutoValue?.salesGroupId || 0, this.selectedStage?.id || 0, this.currenciesDropDownList()[0]?.id || 1)
        }).subscribe({
            next: ({ stageDeals }) => {
                this.stageDeals.set(stageDeals.data || []);
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                this.loadDeals.set(false);
            }
        });
    }

    onAddNewDeal() {
        this.showDealDialog = true;
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

    filterCurrencies(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase() || '';
        const currency = this.currenciesDropDownList() || [];
        this.currenciesAutoFilteredValue = currency.filter(
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

    navigateToAddEditDeal(selectedDeal: SalesDeal) {
        this.router.navigate(['/app/deals/add-edit', { "id": selectedDeal.dealId }]);
    }

    onWinDeal(selectedDeal: SalesDeal) {
        this.selectedDeal = selectedDeal;
        this.dealDialog = {};
        this.showWinDealDialog = true;
    }
    hideWinDealDialog() {
        this.showWinDealDialog = false;
    }
    saveWinDeal() {
    }
    onLoseDeal(selectedDeal: SalesDeal) {
        this.selectedDeal = selectedDeal;
        this.dealDialog = {};

        this.dealsService.getLostReasons().subscribe({
            next: (response) => {
                if (response && response.data) {
                    this.lostReasons = response.data.map((reason: any) => ({
                        id: reason.lostReasonId,
                        name: reason.lostReasonName
                    }));
                }
                this.showLoseDealDialog = true;
            },
            error: () => this.toastService.error('common.error', 'common.failed_to_load_data')
        });
    }

    saveLoseDeal() {
        // console.log(this.loseDealRadioValue);
        // console.log(this.dealDialog);
        // console.log(this.dealDialog.description);
    }

    hideLoseDealDialog() {
        this.showLoseDealDialog = false;
    }



    onRottenDeal(selectedDeal: SalesDeal) {
        this.selectedDeal = selectedDeal;
        this.dealDialog = {};

        const header = this.translate.instant('deals.rotten_deal_confirm_header');
        const message = this.translate.instant('deals.rotten_deal_confirm_message', { dealTitle: this.selectedDeal.dealTitle });

        this.confirmationService.confirm({
            message: message,
            header: header,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('common.yes'),
            rejectLabel: this.translate.instant('common.no'),
            accept: () => {
                this.selectedDeal!.dealStatus = 'R';
                this.dealsService.updateDeal(this.selectedDeal).subscribe({
                    next: () => {
                        this.toastService.success('Success', 'Deal status updated successfully.');
                    },
                    error: () => {
                        this.toastService.error('Error', 'Failed to update deal status.');
                    },
                    complete: () => {
                    }
                });
            }
        });
    }

    onOfferingDeal(selectedDeal: SalesDeal) {

    }



    onDeleteDeal(selectedDeal: SalesDeal) {
        this.selectedDeal = selectedDeal;
        this.dealDialog = {};

        this.showDeleteDealDialog = true;
    }

    deleteDeal() {
        // console.log(this.dealDialog);
    }
    hideDeleteDealDialog() {
        this.showDeleteDealDialog = false;
    }

    isFirstStage(): boolean {
        if (!this.selectedStage || this.pipelineStages.length === 0) {
            return false;
        }
        return this.pipelineStages[0].id === this.selectedStage!.id;
    }
    isLastStage(): boolean {
        if (!this.selectedStage || this.pipelineStages.length === 0) {
            return false;
        }
        const stages = this.pipelineStages;
        return stages[stages.length - 1].id === this.selectedStage!.id;
    }

}
