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
import { DealsService } from '../add-edit-deal.service';
import { forkJoin } from 'rxjs';
import { SalesGroupDropDown } from '../models/sales-group-drop-down.model';
import { PipelineSummary } from '../models/pipeline-smmary.model';
import { CommonRequestsService } from '@/common/services/common-requests.service';
import { MessageService } from 'primeng/api';
import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { ToastModule } from 'primeng/toast';
import { SalesDeal } from '../models/sales-deal.model';

import { ToastService } from '@/common/services/toast.service';
import { Router } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { TextareaModule } from 'primeng/textarea';
import { AddEditActivityDialog } from '@/common/components/add-activity-component copy/add-activity-component';

@Component({
    imports: [CommonModule, ToastModule, TranslateModule, LoadingSpinnerComponent, ButtonModule, TabsModule, TextareaModule, AddEditActivityDialog],
    selector: 'app-add-edit-deal-component',
    templateUrl: './add-edit-deal-component.html',
    providers: [ToastService, TranslateModule],
})
export class AddEditDealComponent implements OnInit {
    collapsed = true;

    salesGroupSelectedAutoValue: SalesGroupDropDown | null = null; // Add the missing property
    salesGroupsDropDownList = signal<SalesGroupDropDown[]>([]);
    salesGroupsAutoFilteredValue: any[] = [];

    toggleDetails() {
        this.collapsed = !this.collapsed;
    }

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

    stageDeals = signal<SalesDeal[]>([]);


    showAddActivityDialog: boolean = false;



    constructor(
        private messageService: MessageService, private dealsService: DealsService, private commonRequestsService: CommonRequestsService,
        private toastService: ToastService, private router: Router, private translate: TranslateService
    ) { }

    ngOnInit() {
        this.loading.set(true);

        forkJoin({
            salesGroups: this.dealsService.getAllUserSalesGroups(),
        }).subscribe({
            next: ({ salesGroups, }) => {
                this.salesGroupsDropDownList.set(salesGroups.data || []);
                this.salesGroupSelectedAutoValue = this.salesGroupsDropDownList()[0] || null;
            },
            error: () => {
                this.toastService.error("common.error", "common.failed_to_load_data");
            }, complete: () => {
                this.toastService.warn("common.warning", "common.this_page_is_still_under_development");
                this.loading.set(false);

            }
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

    addDeal() { }


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



    onAddService() {
    }
    onEditService() {

    }
    onDeleteService() {

    }
    getSeverity(product: Product) {
        switch (product.inventoryStatus) {
            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warn';

            case 'OUTOFSTOCK':
                return 'danger';

            default:
                return 'info';
        }
    }


    back() {
        this.router.navigate(['/app/deals/']); // Implement navigation

    }

    onAddActivity() {
        this.showAddActivityDialog = true;
    }

}
