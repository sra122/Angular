import {
    Component,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { Translation, TranslationService } from 'angular-l10n';
import { StatsDataService } from '../stats-view/stats-view.service';
import { TerraSimpleTableComponent } from '@plentymarkets/terra-components';
import { TerraSimpleTableHeaderCellInterface } from '@plentymarkets/terra-components';
import { TerraSimpleTableRowInterface } from '@plentymarkets/terra-components';
import { TerraSimpleTableCellInterface } from '@plentymarkets/terra-components';
import { TerraButtonInterface } from '@plentymarkets/terra-components';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'items-status',
    template: require('./items-status.component.html'),
    styles:   [require('./items-status.component.scss')]
})
export class ItemsStatusComponent extends Translation implements OnInit
{
    public table:TerraSimpleTableComponent<any>;
    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private itemsStatus:any;
    private _viewContainerRef:ViewContainerRef;
    private _headerList:Array<TerraSimpleTableHeaderCellInterface> = [];
    private _rowList:Array<TerraSimpleTableRowInterface<any>> = [];

    constructor(public translation:TranslationService,
                public viewContainerRef:ViewContainerRef,
                private _statsDataService:StatsDataService)
    {
        super();
        this._isLoading = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
        this._viewContainerRef = viewContainerRef;
    }

    public ngOnInit():void
    {
        this.getTestData();
    }

    private getTestData():any
    {
        let headerNames:any = ['VariationId', 'Attribute Name', 'Attribute Value', 'status'];

        for(let headerName of headerNames)
        {
            let cell:TerraSimpleTableHeaderCellInterface = {
                caption: headerName,
                width:   '100',
            };

            this.headerList.push(cell);
        }

        this._statsDataService.getRestCallData('status').subscribe(
            (response:any) => {
                this.itemsStatus = response;
            }
        );

        this._statsDataService.getRestCallData('items-status').subscribe(
            (response:any) => {
                for(let item of response.entries)
                {
                    let currentAttributes:any = [];
                    let cellList:Array<TerraSimpleTableCellInterface> = [];
                    let variationId:TerraSimpleTableCellInterface = {
                        caption: item.id,
                        icon: 'icon-referrer_backend'
                    };

                    cellList.push(variationId);

                    if(!isNullOrUndefined(item.VariationAttributeValues[0])) {
                        let attributeName:TerraSimpleTableCellInterface = {
                            caption: item.VariationAttributeValues[0].attribute.backendName,
                            icon: 'icon-referrer_backend'
                        };
                        cellList.push(attributeName);
                        currentAttributes.push(item.VariationAttributeValues[0].attribute.backendName);
                    }else {
                        cellList.push();
                    }

                    if(!isNullOrUndefined(item.VariationAttributeValues[0])) {
                        let attributeValue:TerraSimpleTableCellInterface = {
                            caption: item.VariationAttributeValues[0].attributeValue.backendName,
                            icon: 'icon-referrer_backend'
                        };
                        cellList.push(attributeValue);
                    } else {
                        cellList.push();
                    }

                    if(!isNullOrUndefined(this.itemsStatus[item.id])) {
                        let status:TerraSimpleTableCellInterface = {
                            caption: 'Attributes ' + this.itemsStatus[item.id] + ' is missing',
                            icon: 'icon-referrer_backend'
                        };
                        cellList.push(status);
                    }


                    let row:TerraSimpleTableRowInterface<any> = {
                        cellList: cellList
                    };

                    this.rowList.push(row);
                }
            }
        );
    }

    public get headerList():Array<TerraSimpleTableHeaderCellInterface>
    {
        return this._headerList;
    }

    public get rowList():Array<TerraSimpleTableRowInterface<any>>
    {
        return this._rowList;
    }
}
