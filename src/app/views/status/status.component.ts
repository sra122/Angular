import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';
import { TerraOverlayComponent } from '@plentymarkets/terra-components';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { StatsDataService } from '../stats-view/stats-view.service';
import { Translation, TranslationService } from 'angular-l10n';

interface NotificationInterface
{
    propertyName?:string;
    propertyValue?:any;
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
    public _propertyNotFound:Array<NotificationInterface> = [];

    public _expireTime:any;
    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService)
    {
        super();
        this._isLoading = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
        this.productStatus = '';
    }

    public ngOnInit():void
    {
        this.getProductStatus();
    }

    private getProductStatus():any
    {
        /*this._statsDataService.postPbProducts('markets/panda-black/products-data').subscribe((response:any) => {
            if(!isNullOrUndefined(response)) {
                let missingProducts:any = response.unfulfilledProducts.missingAttributeProducts;
                for(let key in missingProducts) {
                    if(missingProducts.hasOwnProperty(key)) {
                        for(let missingProductKey in missingProducts[key]) {
                            if(missingProducts[key].hasOwnProperty(missingProductKey)) {
                                this.productStatus['missingAttributeProducts'][key][missingProductKey] = missingProducts[key][missingProductKey];
                            }
                        }
                        console.log(key);
                    }
                }
                console.log(missingProducts);
            }

            console.log(this.productStatus);
        });*/

        this._statsDataService.getRestCallData('markets/panda-black/notifications').subscribe((response:any) => {
            for(let key in response.propertyNotFound)
            {
                if(response.propertyNotFound.hasOwnProperty(key)) {
                    this._propertyNotFound.push({
                        propertyName: key,
                        propertyValue: response.propertyNotFound[key]
                    });
                }
            }
        });
    }

    private getAttributeNames():any
    {
        this._statsDataService.getRestCallData('test').subscribe((response:any) => {
           console.log(response);
        });
    }
}
