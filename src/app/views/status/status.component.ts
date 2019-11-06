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
    message?:string;
    notification_identifier?:number;
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
    public admin:Array<AdminNotifications>;
    public pagingData:TerraPagerInterface;

    public _expireTime:any;
    private _isLoading:boolean;
    private _productStatus:any;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private _viewContainerRef:ViewContainerRef;
    private _errorHeaderList:Array<TerraSimpleTableHeaderCellInterface> = [];
    private _validHeaderList:Array<TerraSimpleTableHeaderCellInterface> = [];
    private _errorRowList:Array<TerraSimpleTableRowInterface<any>> = [];
    private _validRowList:Array<TerraSimpleTableRowInterface<any>> = [];
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();
    private _errorHeaderInfo:any = [
        this.translation.translate('status.variationId'),
        this.translation.translate('status.missing-properties'),
        this.translation.translate('status.stock'),
        this.translation.translate('status.Asin'),
        this.translation.translate('status.missing-images'),
        this.translation.translate('status.valid-category')
    ];

    private _validHeaderInfo:any = [
        this.translation.translate('status.item_id'),
        this.translation.translate('status.title')
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
        this.getProductStatus();
        this.errorHeaderList();
        this.errorRowList();
        this.validHeaderList();
        this.validRowList();
        this.getNotifications();
    }


    public getNotifications():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/notifications').subscribe((notifications:any) => {
            this.admin = notifications;
            console.log(this.admin);
        });
    }



    public markAsRead(id:any):any
    {
        console.log('in function');
        console.log('test' + id);
        this._statsDataService.postNotificationRead(parseInt(id, 10)).subscribe((response:any) => {
            this.ngOnInit();
        });
    }


    public getProductStatus():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/products-status').subscribe((products:any) => {
            this._productStatus = products;
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


    public errorHeaderList():Array<TerraSimpleTableHeaderCellInterface>
    {
        this._errorHeaderList = [];
        for(let i:number = 0; i < this._errorHeaderInfo.length; i++)
        {
            if(this._errorHeaderInfo[i] === this.translation.translate('status.missing-properties')) {
                let cell:TerraSimpleTableHeaderCellInterface = {
                    caption: this._errorHeaderInfo[i],
                    width:   '250',
                };
                this._errorHeaderList.push(cell);
            } else {
                let cell:TerraSimpleTableHeaderCellInterface = {
                    caption: this._errorHeaderInfo[i],
                    width:   '50',
                };
                this._errorHeaderList.push(cell);
            }
        }

        return this._errorHeaderList;
    }

    public errorRowList():Array<TerraSimpleTableRowInterface<any>>
    {
        this._errorRowList = [];

        let products:any = this._productStatus;

        this.pagingData = {
            pagingUnit: 'pagingEntries',
            totalsCount: products.errorProducts.length,
            page: 1,
            itemsPerPage:   50,
            lastPageNumber: 7,
            firstOnPage:    1,
            lastOnPage:     50,
            isLastPage:     false
        };

        if(!isNullOrUndefined(products.errorProducts)) {
            for(let errorProduct of products.errorProducts)
            {
                let cellList:Array<TerraSimpleTableCellInterface> = [];

                let articleId:TerraSimpleTableCellInterface = {
                    caption: errorProduct.product_id,
                };
                cellList.push(articleId);

                /* Missing Properties */
                if(isNullOrUndefined(errorProduct.missing_attributes)) {
                    let missingProperty:TerraSimpleTableCellInterface = {
                    };
                    cellList.push(missingProperty);
                } else if(!isNullOrUndefined(errorProduct.missing_attributes)) {
                    let missingProperty:TerraSimpleTableCellInterface = {
                        caption: errorProduct.missing_attributes
                    };
                    cellList.push(missingProperty);
                }

                /* Stock */
                let stock:boolean = errorProduct.missing_stock;

                if(!stock) {
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
                let asin:boolean = errorProduct.missing_asin;

                if(!asin) {
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


                /* Missing Images */
                let missingImages:boolean = errorProduct.misssing_images;

                if(!missingImages) {
                    let missingImagesProperty:TerraSimpleTableCellInterface = {
                        icon: 'icon-success'
                    };
                    cellList.push(missingImagesProperty);
                } else {
                    let missingImagesProperty:TerraSimpleTableCellInterface = {
                        icon: 'icon-close'
                    };
                    cellList.push(missingImagesProperty);
                }


                /* Category */
                let category:boolean = errorProduct.invalid_category;

                if(!category) {
                    let categoryInfo:TerraSimpleTableCellInterface = {
                        icon: 'icon-success'
                    };
                    cellList.push(categoryInfo);
                } else {
                    let categoryInfo:TerraSimpleTableCellInterface = {
                        icon: 'icon-close'
                    };
                    cellList.push(categoryInfo);
                }

                let row:TerraSimpleTableRowInterface<any> = {
                    cellList: cellList
                };

                this._errorRowList.push(row);
            }
        }

        return this._errorRowList;
    }



    public validHeaderList():Array<TerraSimpleTableHeaderCellInterface>
    {
        this._validHeaderList = [];
        for(let i:number = 0; i < this._validHeaderInfo.length; i++)
        {
            if(this._validHeaderInfo[i] === this.translation.translate('status.title')) {
                let cell:TerraSimpleTableHeaderCellInterface = {
                    caption: this._validHeaderInfo[i],
                    width:   '250',
                };
                this._validHeaderList.push(cell);
            } else {
                let cell:TerraSimpleTableHeaderCellInterface = {
                    caption: this._validHeaderInfo[i],
                    width:   '50',
                };
                this._validHeaderList.push(cell);
            }
        }

        return this._validHeaderList;
    }



    public validRowList():Array<TerraSimpleTableRowInterface<any>>
    {
        this._validRowList = [];

        let products:any = this._productStatus;

        this.pagingData = {
            pagingUnit: 'pagingEntries',
            totalsCount: products.validProducts.length,
            page: 1,
            itemsPerPage:   50,
            lastPageNumber: 7,
            firstOnPage:    1,
            lastOnPage:     50,
            isLastPage:     false
        };

        if(!isNullOrUndefined(products.validProducts)) {
            for(let validProduct of products.validProducts)
            {
                let cellList:Array<TerraSimpleTableCellInterface> = [];

                let articleId:TerraSimpleTableCellInterface = {
                    caption: validProduct.itemId,
                };
                cellList.push(articleId);

                /* Missing Title */
                if (isNullOrUndefined(validProduct.title)) {
                    let title:TerraSimpleTableCellInterface = {};
                    cellList.push(title);
                } else if (!isNullOrUndefined(validProduct.title)) {
                    let title:TerraSimpleTableCellInterface = {
                        caption: validProduct.title
                    };
                    cellList.push(title);
                }

                let row:TerraSimpleTableRowInterface<any> = {
                    cellList: cellList
                };

                this._validRowList.push(row);
            }
        }

        return this._validRowList;
    }
}
