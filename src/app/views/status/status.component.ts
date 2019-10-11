import {
    Component,
    OnInit,
    ViewChild, ViewContainerRef
} from '@angular/core';
import { TerraOverlayComponent, TerraPagerInterface, TerraSimpleTableCellInterface, TerraSimpleTableComponent, TerraSimpleTableHeaderCellInterface, TerraSimpleTableRowInterface } from '@plentymarkets/terra-components';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { StatsDataService } from '../stats-view/stats-view.service';
import { Translation, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

interface NoAttributeProducts
{
    productId?:any;
}

interface MissingProductAttributes
{
    productId?:number;
    attributes?:string;
}

interface NoStockProducts
{
    productId?:any;
}

interface NoAsinProducts
{
    productId?:any;
}

interface AdminNotifications
{
    msg?:string;
    category_id?:number;
    type?:string;
    action?:string;
    value?:string;
    oldValue?:string;
    id?:number;
    category_name?:string;
}

@Component({
    selector: 'status',
    template: require('./status.component.html'),
    styles:   [require('./status.component.scss')]
})

export class StatusComponent extends Translation implements OnInit
{
    @ViewChild('viewChildOverlayWithPrimaryButton') public viewChildOverlayWithPrimaryButton:TerraOverlayComponent;
    @ViewChild('viewChildOverlayStatic') public viewChildOverlayStatic:TerraOverlayComponent;
    @ViewChild('table') public table:TerraSimpleTableComponent<any>;
    public productStatus:any;
    public errorProducts:any = [];
    public errorProductAttributes:any = [];
    public emptyAttributeProducts:Array<NoAttributeProducts> = [];
    public missingAttributeProducts:Array<MissingProductAttributes> = [];
    public noStockProducts:Array<NoStockProducts> = [];
    public noAsinProducts:Array<NoAsinProducts> = [];
    public admin:Array<AdminNotifications> = [];
    public pagingData:TerraPagerInterface;

    public _expireTime:any;
    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private _viewContainerRef:ViewContainerRef;
    private _headerList:Array<TerraSimpleTableHeaderCellInterface> = [];
    private _rowList:Array<TerraSimpleTableRowInterface<any>> = [];
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();
    private _headerInfo:any = [
        this.translation.translate('status.variationId'),
        this.translation.translate('status.missing-properties'),
        this.translation.translate('status.stock'),
        this.translation.translate('status.Asin'),
        this.translation.translate('status.related-Properties')
    ];

    constructor(private _statsDataService:StatsDataService, private viewContainerRef:ViewContainerRef)
    {
        super();
        this._isLoading = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
        this.productStatus = '';
        this._viewContainerRef = viewContainerRef;
    }

    public ngOnInit():void
    {
        this.missingAttributeProducts = [];
        this.noStockProducts = [];
        this.noAsinProducts = [];
        this.emptyAttributeProducts = [];
        this.admin = [];
        this.headerList();
        this.rowList();
    }


    public deletePropertyNotification(property:any, notificationType:string):any
    {
        this._statsDataService.postRemoveNotification(property, notificationType).subscribe((response:any) => {
        });
        this.ngOnInit();
    }


    public validationProducts():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/products-status').subscribe((response:any) => {
            this.ngOnInit();
        });
    }

    /**
     *
     * @param values
     */
    public arrayValues(values:any):any
    {
        let tempArr:any = [];

        for(let value of values)
        {
            tempArr.push(value);
        }

        return tempArr;
    }


    public headerList():Array<TerraSimpleTableHeaderCellInterface>
    {
        this._headerList = [];
        for(let i:number = 0; i < this._headerInfo.length; i++)
        {
            if(this._headerInfo[i] === this.translation.translate('status.missing-properties')) {
                let cell:TerraSimpleTableHeaderCellInterface = {
                    caption: this._headerInfo[i],
                    width:   '250',
                };
                this._headerList.push(cell);
            } else {
                let cell:TerraSimpleTableHeaderCellInterface = {
                    caption: this._headerInfo[i],
                    width:   '50',
                };
                this._headerList.push(cell);
            }
        }

        return this._headerList;
    }

    public rowList():Array<TerraSimpleTableRowInterface<any>>
    {
        this._rowList = [];

        this._statsDataService.getRestCallData('markets/panda-black/notifications').subscribe((notification:any) => {

            this.pagingData = {
                pagingUnit: 'pagingEntries',
                totalsCount: notification.errorProducts.length,
                page: 1,
                itemsPerPage:   50,
                lastPageNumber: 7,
                firstOnPage:    1,
                lastOnPage:     50,
                isLastPage:     false
            };

            if(!isNullOrUndefined(notification.errorProducts)) {
                for(let productId in notification.errorProducts)
                {
                    if(notification.errorProducts.hasOwnProperty(productId))
                    {
                        let cellList:Array<TerraSimpleTableCellInterface> = [];

                        let articleId:TerraSimpleTableCellInterface = {
                            caption: productId,
                        };
                        cellList.push(articleId);

                        /* Missing Properties */
                        if(isNullOrUndefined(notification.errorProductAttributes)) {
                            let missingProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-success'
                            };
                            cellList.push(missingProperty);
                        } else if(!isNullOrUndefined(notification.errorProductAttributes)) {
                            let missingProperty:TerraSimpleTableCellInterface = {
                                caption: (this.arrayValues(Object.assign([], notification.errorProductAttributes[productId])).join(',')).replace(',,', '')
                            };
                            cellList.push(missingProperty);
                        }

                        /* Stock */
                        let stock:number = notification.errorProducts[productId].indexOf('No-Stock');

                        if(stock === -1) {
                            let stockProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-success'
                            };
                            cellList.push(stockProperty);
                        } else {
                            let stockProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-close'
                            };
                            cellList.push(stockProperty);
                        }


                        /* Asin */
                        let asin:number = notification.errorProducts[productId].indexOf('No-Asin');

                        if(asin === -1) {
                            let asinProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-success'
                            };
                            cellList.push(asinProperty);
                        } else {
                            let asinProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-close'
                            };
                            cellList.push(asinProperty);
                        }


                        /* Related Properties */
                        let relatedProperties:number = notification.errorProducts[productId].indexOf('emptyAttributeProduct');

                        if(relatedProperties === -1) {
                            let relatedProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-success'
                            };
                            cellList.push(relatedProperty);
                        } else {
                            let relatedProperty:TerraSimpleTableCellInterface = {
                                icon: 'icon-close'
                            };
                            cellList.push(relatedProperty);
                        }

                        let row:TerraSimpleTableRowInterface<any> = {
                            cellList: cellList
                        };

                        this._rowList.push(row);
                    }
                }
            }
        });
        return this._rowList;
    }
}
