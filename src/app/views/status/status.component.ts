import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';
import { TerraOverlayComponent } from '@plentymarkets/terra-components';
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
    public productStatus:any;
    public emptyAttributeProducts:Array<NoAttributeProducts> = [];
    public missingAttributeProducts:Array<MissingProductAttributes> = [];
    public noStockProducts:Array<NoStockProducts> = [];
    public noAsinProducts:Array<NoAsinProducts> = [];
    public admin:Array<AdminNotifications> = [];

    public _expireTime:any;
    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();

    constructor(private _statsDataService:StatsDataService)
    {
        super();
        this._isLoading = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
        this.productStatus = '';
    }

    public ngOnInit():void
    {
        this.missingAttributeProducts = [];
        this.noStockProducts = [];
        this.noAsinProducts = [];
        this.emptyAttributeProducts = [];
        this.admin = [];
        this.notifications();
    }

    public notifications():any {
        this._statsDataService.getRestCallData('markets/panda-black/notifications').subscribe((notification:any) => {

            if(!isNullOrUndefined(notification.missingAttributeProducts)) {
                for(let productId in notification.missingAttributeProducts)
                {
                    if(notification.missingAttributeProducts.hasOwnProperty(productId)) {
                        this.missingAttributeProducts.push({
                            productId: parseInt(productId, 10),
                            attributes:  (this.arrayValues(Object.assign([], notification.missingAttributeProducts[productId])).join(',')).replace(',,', '')
                        });
                    }
                }
            }

            if(!isNullOrUndefined(notification.noStockProducts)) {
                for(let productId of notification.noStockProducts)
                {
                    this.noStockProducts.push({
                        productId: productId
                    });
                }
            }

            if(!isNullOrUndefined(notification.noAsinProducts)) {
                for(let productId of notification.noAsinProducts)
                {
                    this.noAsinProducts.push({
                        productId: productId
                    });
                }
            }

            if(!isNullOrUndefined(notification.emptyAttributeProducts)) {
                for(let productId of notification.emptyAttributeProducts)
                {
                    this.emptyAttributeProducts.push({
                        productId: productId
                    });
                }
            }

            if(!isNullOrUndefined(notification.admin)) {
                for(let id in notification.admin)
                {
                    if(notification.admin.hasOwnProperty(id)) {
                        // New Attribute
                        if(notification.admin[id].type === 'attribute' && notification.admin[id].values.action === 'new') {
                            this.admin.push({
                                msg: 'Neu attribute ' + notification.admin[id].values.value + ' erstellt für Kategorie ' + notification.admin[id].categoryName,
                                id: notification.admin[id].id
                            });
                        }

                        // Name Change to Attribute
                        if(notification.admin[id].type === 'attribute' && notification.admin[id].values.action === 'rename') {
                            this.admin.push({
                                msg: 'Attribute ' + notification.admin[id].values.oldValue + ' geändert zu ' + notification.admin[id].values.value + ' im Kategorie ' + notification.admin[id].categoryName,
                                id: notification.admin[id].id
                            });
                        }

                        // New Attribute Value
                        if(notification.admin[id].type === 'attribute_value' && notification.admin[id].values.action === 'new') {
                            this.admin.push({
                                msg: 'Neu attribute value ' + notification.admin[id].values.value + ' erstellt für Kategorie ' + notification.admin[id].categoryName,
                                id: notification.admin[id].id
                            });
                        }

                        // Name Change to Attribute Value
                        if(notification.admin[id].type === 'attribute_value' && notification.admin[id].values.action === 'rename') {
                            this.admin.push({
                                msg: 'Attribute value' + notification.admin[id].values.oldValue + ' geändert zu ' + notification.admin[id].values.value + ' im Kategorie ' + notification.admin[id].categoryName,
                                id: notification.admin[id].id
                            });
                        }

                        // Info
                        if(notification.admin[id].type === 'info') {
                            this.admin.push({
                                msg: notification.admin[id].values.message,
                                id: notification.admin[id].id
                            });
                        }
                    }
                }
            }

        });
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
}
