import {
    Component, Input,
    OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { StatsDataService } from './stats-view.service';
import {
    TerraAlertComponent, TerraLeafInterface, TerraMultiSplitViewInterface, TerraOverlayButtonInterface,
    TerraOverlayComponent,
    TerraSelectBoxValueInterface
} from '@plentymarkets/terra-components';
import { Translation, TranslationService } from 'angular-l10n';
import { VendorCategoriesService } from '../../core/rest/markets/panda-black/vendorcategories/vendorcategories.service';

import { isNullOrUndefined, isObject } from 'util';
import { LoadingConfig } from '../../core/config/loading.config';

interface CategoriesInterface
{
    id?:number;
    level?:number;
    name?:any;
    parentId?:number;
    parentCategoryId:any;
    child:Array<CategoriesInterface>;
    children?:Array<CategoriesInterface>;
    details?:Array<CategoriesInterface>;
    subLeafList?:Array<CategoryInterface>;
}

interface CorrelationsInterface
{
    entries?:Array<CorrelationInterface>;
}

interface CorrelationInterface
{
    id?:number;
    type?:string;
    settings?:Array<EachCategoryMappingInterface>;
}

interface EachCategoryMappingInterface
{
    category?:Array<CategoryInterface>;
    vendorCategory?:Array<VendorCategoryInterface>;
    attributes?:Array<VendorAttributesDataInterface>;
}

interface VendorCategoriesInterface
{
    id?:number;
    level?:number;
    name?:any;
    parentId?:number;
    children?:Array<VendorCategoriesInterface>;
    details?:Array<VendorCategoriesInterface>;
    subLeafList?:Array<VendorCategoryInterface>;
}

interface VendorCategoryInterface
{
    id?:number;
    caption?:any;
    subLeafList?:Array<VendorCategoryInterface>;

}

interface CategoryInterface
{
    id?:number;
    caption?:any;
    name?:any;
    subLeafList?:Array<CategoryInterface>;
}

interface VendorCategoryCorrelationInterface
{
    category?:any;
    vendorCategory?:any;
    attributes?:any;
}

interface VendorAttributesDataInterface
{
    category_id?:any;
    category_name?:string;
    name?:string;
    required:boolean;
    values:any;
}

interface VendorAttributeInterface
{
    value:any;
    caption:string | number;
    icon?:string;
    position?:number;
    pickedValue?:any;
}

interface AttributeMappingInterface
{
    id:number;
    marketplaceId:string;
    type:string;
    settings:AttributeMappingInfoInterface;
}

interface AttributeMappingInfoInterface
{
    vendorAttribute:string;
    plentyAttribute:string;
}


@Component({
    selector: 'stats-view',
    template: require('./stats-view.component.html'),
    styles:   [require('./stats-view.component.scss')]
})
export class StatsViewComponent extends Translation implements OnInit
{
    @Input() public splitViewInstance:TerraMultiSplitViewInterface;
    public categories:Array<CategoriesInterface>;
    public category:CategoryInterface;
    public vendorCategories:Array<VendorCategoriesInterface>;
    public vendorCategoriesCorrelation:VendorCategoryCorrelationInterface;
    public vendorCategoriesCorrelationArray:Array<any>;
    public categoryAttributes:Array<any>;
    @Input() public vendorCategoryArray:Array<any>;
    @Input() public categoryMapping:Array<CorrelationsInterface>;
    @ViewChild('viewChildOverlayWithPrimaryButton') public viewChildOverlayWithPrimaryButton:TerraOverlayComponent;
    @ViewChild('viewChildOverlayAttribute') public viewChildOverlayAttribute:TerraOverlayComponent;
    private _primaryButtonInterface:TerraOverlayButtonInterface;
    private _selectableOptionTypesList:Array<TerraSelectBoxValueInterface> = [];
    private _selectableVendorCategoriesList:Array<VendorAttributeInterface> = [];

    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private _isLoading:boolean;
    private vendorOnlyParentCategorySelection:boolean;
    private vendorCategoryName:string;
    private categoryName:string;
    private categoryArray:Array<any>;
    private _viewContainerRef:ViewContainerRef;
    private attributeMappingRecord:Array<any>;
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();
    private editCorrelationId:number = 0;
    private vendorParentCategory:Array<any>;
    private _orderId:number;

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService,
                public _vendorCategories:VendorCategoriesService,
                private _loadingConfig:LoadingConfig,
                viewContainerRef:ViewContainerRef)
    {
        super();

        this._isLoading = false;
        this._alert = TerraAlertComponent.getInstance();
        this._lastUiId = 0;
        this.vendorCategoryName = '';
        this.categoryName = '';
        this.categoryMapping = [];
        this.vendorCategoryArray = [];
        this.vendorCategoriesCorrelationArray = [];
        this._selectableOptionTypesList = [];
        this._selectableVendorCategoriesList = [];
        this.categoryAttributes = [];
        this._viewContainerRef = viewContainerRef;
        this.attributeMappingRecord = [];
        this.editCorrelationId = 0;
        this.vendorOnlyParentCategorySelection = false;
    }

    public ngOnInit():void
    {
        this._isLoading = true;
        this.getCorrelation();
    }

    public openOverlayForAttributeMapping():void
    {
        this.viewChildOverlayWithPrimaryButton.showOverlay();
    }

    public sendProducts():void
    {
        this._statsDataService.postPbProducts('markets/panda-black/products-data').subscribe((response:any) => {
            if(!isNullOrUndefined(response)) {
                let unfullfilledProducts:any = response.unfulfilledProducts;
                if(unfullfilledProducts.missingAttributeProducts.length > 0) {
                    this.alert.addAlert( {
                        msg:   'Der Artikel mit der Varianten' + (unfullfilledProducts.missingAttributeProducts.length === 1 ? 'Id ' : 'Ids ') + unfullfilledProducts.missingAttributeProducts.join() + ' verfügt nicht über alle benötigten Attributzuweisungen.  Bitte überprüfen Sie den besagten Artikel',
                        type:  'danger',
                        dismissOnTimeout: 50000
                    });
                }
                if(unfullfilledProducts.emptyAttributeProducts.length > 0) {
                    this.alert.addAlert( {
                       msg:   'Der Artikel mit der Varianten' + (unfullfilledProducts.emptyAttributeProducts.length === 1 ? ' Id ' : ' Ids ') + unfullfilledProducts.emptyAttributeProducts.join() + ' hat ungemappte Attribute.',
                       type:  'danger',
                       dismissOnTimeout: 50000
                    });
                }
                if(unfullfilledProducts.noStockProducts.length > 0) {
                    this.alert.addAlert( {
                        msg:   'Der Artikel mit der Varianten' + (unfullfilledProducts.noStockProducts.length === 1 ? 'Id ' : 'Ids ') + unfullfilledProducts.noStockProducts.join() + ' hat keine stock. Bitte tragen Sie diese nach, um das Produkt an PANDA.BLACK zu senden.',
                        type:  'danger',
                        dismissOnTimeout: 50000
                    });
                }

                if(unfullfilledProducts.noAsinProducts.length > 0) {
                    this.alert.addAlert( {
                        msg:   'Der Artikel mit der Varianten' + (unfullfilledProducts.noAsinProducts.length === 1 ? 'Id ' : 'Ids ') + unfullfilledProducts.noAsinProducts.join() + ' hat keine ASIN. Bitte tragen Sie diese nach, um das Produkt an PANDA.BLACK zu senden.',
                        type:  'danger',
                        dismissOnTimeout: 50000
                    });
                }

                if(response.validProductDetails.length > 0) {
                    for(let validProduct of response.validProductDetails) {
                        this.alert.addAlert( {
                            msg:   'Der Artikel mit der VariantenId ' + validProduct.product_id + ' wird erfolgreich an PANDA.BLACK gesendet.',
                            type:  'success',
                            dismissOnTimeout: 10000
                        });
                    }
                } else {
                    this.alert.addAlert({
                        msg:  this.translation.translate('stats-view.productsNotSentMessage'),
                        type: 'danger',
                        dismissOnTimeout: 50000
                    });
                }
            }
        });
    }

    public categoryExtraction():void
    {
        this.categoryMapping = [];
        this.categoryAttributes = [];
        this.attributeMappingRecord = [];
        this.getParentCategories();
        this.getVendorCategories();
        this.getCorrelation();
        this.editCorrelationId = 0;
        this.vendorCategoryArray = [];
        this.categoryArray = [];
        this.vendorParentCategory = [];
    }

    private getParentCategories():void
    {
        this.categories = [];
        this._statsDataService.getRestCallData('markets/panda-black/parent-categories').subscribe((response:any) =>
        {
            for(let category of response)
            {
                if(!isNullOrUndefined(category.child)) {
                    this.categories.push(this.getChildCategories(category));
                }
            }
        });
    }

    private getChildCategories(category:CategoriesInterface):any
    {
        this.vendorCategoriesCorrelation = {};

        let leafData:TerraLeafInterface = {
            caption: category.details[0].name,
            id: category.id,
            icon:null,
            subLeafList:null,
            isActive: false,
            clickFunction:  ():void =>
            {
                this._statsDataService.getRestCallData('markets/panda-black/child-categories/' + category.id).subscribe((response:any) => {
                    if(!isNullOrUndefined(response) && response.length > 0)
                    {
                        leafData.subLeafList = [];
                        leafData.icon = 'icon-folder';
                        response.forEach((child:CategoriesInterface) => {
                            leafData.subLeafList.push(this.getChildCategories(child));
                        });
                    }
                });

                this._statsDataService.getRestCallData('markets/panda-black/parent-categories/' + category.id).subscribe((response:any) =>
                {
                    this.categoryArray = [];
                    this.categoryArray.push(response);
                    if(this.vendorOnlyParentCategorySelection) {
                        this.alert.addAlert({
                            msg:              'Bitte wählen sie eine Unterkategorie aus dem PANDA.BLACK Kategoriebaum.',
                            type:             'warning',
                            dismissOnTimeout: 5000
                        });
                    }
                    if(this.vendorCategoryArray.length !== 0 && this.categoryArray.length !== 0) {
                        this.createCorrelation();
                    }
                });
            }
        };

        if(!isNullOrUndefined(category.child))
        {
            leafData.icon = 'icon-folder';
            leafData.subLeafList = [];
        }
        return leafData;
    }


    private getVendorCategories():void
    {
        this.vendorCategories = [];
        this._statsDataService.getRestCallData('markets/panda-black/vendor-categories').subscribe((response:any) =>
        {
            for(let category of response)
            {
                this.vendorCategories.push(this.getVendorChildCategories(category));
            }
        });
    }

    private getVendorChildCategories(category:CategoriesInterface):TerraLeafInterface
    {
        let vendorLeafData:TerraLeafInterface = {
            caption: category.name,
            id: category.id,
            icon:null,
            subLeafList:null,
            isActive: false,
            clickFunction: ():void =>
                            {
                                this.vendorCategoryArray = [];
                                if(category.parentId !== 0) {
                                    this.vendorOnlyParentCategorySelection = false;
                                    this.vendorCategoryArray.push(category);
                                } else {
                                    this.vendorOnlyParentCategorySelection = true;
                                }
                                if(this.categoryArray.length !== 0 && this.vendorCategoryArray.length !== 0) {
                                    this.createCorrelation();
                                }
                            }
        };

        if(!isNullOrUndefined(category.children))
        {
            if(category.children.length > 0)
            {
                vendorLeafData.icon = 'icon-folder';
                vendorLeafData.subLeafList = [];
            }

            category.children.forEach((child:any) =>
            {
                vendorLeafData.subLeafList.push(this.getVendorChildCategories(child));
            });
        }

        return vendorLeafData;
    }

    private getCorrelation():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/correlations').subscribe((response:any) =>
        {
            for(let category of response.entries)
            {
                this.categoryMapping.push(category);
            }
        });
        return this.categoryMapping;
    }

    private createCorrelation():void
    {
        this._isLoading = true;

        if(!isNullOrUndefined(this.vendorCategoryArray) && !isNullOrUndefined((this.categoryArray)))
        {
           if(this.vendorCategoryArray.length > 0 && this.categoryArray.length > 0)
           {
               let count:number = 0;
               this.categoryMapping.forEach(function (value:any):void {
                   if(
                       this.vendorCategoryArray[0].id === value.settings[0].vendorCategory[0].id &&
                       this.categoryArray[0].id === value.settings[0].category[0].id
                   )
                   {
                      count++;
                   }
               }.bind(this));

               if(count <= 0 || this.editCorrelationId !== 0)
               {
                   this._statsDataService.getRestCallData(
                       'markets/panda-black/vendor-attribute/' + this.vendorCategoryArray[0].id
                   ).subscribe((response:any) => {
                       if(!isNullOrUndefined(response)) {
                           let n:number = 0;
                           for(let k in response) {
                               if(response.hasOwnProperty(k)) {
                                   if(response[k].required === true) {
                                       this.categoryAttributes[n++] = response[k].name + '-PB-' + k;
                                   }
                               }
                           }
                           this.openOverlayForAttributeMapping();
                           this.attributeMapping(this.vendorCategoryArray[0].id);
                       }
                   });

                   this.vendorCategoriesCorrelation = {
                       category: this.categoryArray,
                       vendorCategory: this.vendorCategoryArray,
                       attributes: this.categoryAttributes
                   };
                   if(this.vendorCategoriesCorrelationArray.length > 0) {
                       this.vendorCategoriesCorrelationArray = [];
                   }
                   this.vendorCategoriesCorrelationArray.push(this.vendorCategoriesCorrelation);
                   this.categoryAttributes = [];

               } else {
                   this.alert.addAlert({
                       msg:              'Dieses Kategorie Mapping existiert bereits.',
                       type:             'warning',
                       dismissOnTimeout: 5000
                   });
               }
           }
        }
    }

    private createCorrelationMapping():void
    {
        if(this.editCorrelationId === 0) {
            this._statsDataService.postRestCallData(this.vendorCategoriesCorrelationArray).subscribe((response:any) => {
            });
            this.vendorCategoryArray.splice(0, 1);
            this.categoryArray.splice(0, 1);
            this.categoryExtraction();
        } else {
            this._statsDataService.editCorrelation(this.vendorCategoriesCorrelationArray, this.editCorrelationId).subscribe((response:any) => {
            });
            this.vendorCategoryArray.splice(0, 1);
            this.categoryArray.splice(0, 1);
            this.editCorrelationId = 0;
            this.categoryExtraction();
        }
    }

    private attributeMapping(attributeData:any):void
    {
        this._primaryButtonInterface = {
            icon:          'icon-confirm',
            caption:       this.translation.translate('stats-view.attributeMappingButton'),
            isDisabled:    false,
            clickFunction: ():void => this.createPBAttribute(attributeData)
        };
    }

    private createPBAttribute(id:any):void
    {
        this.createCorrelationMapping();
        /*this._statsDataService.postAttribute(id).subscribe((response:any) => {
        });
        this.createCorrelationMapping();
        this.alert.addAlert({
            msg:              'Die Kategoriezuordnung wird erstellt. Bitte ordnen Sie alle Attribute zu, die für die Variation erforderlich sind.',
            type:             'success',
            dismissOnTimeout: 5000
        });*/
    }

    private deleteAllCorrelations():void
    {
        this._statsDataService.deleteRestCallData('markets/panda-black/correlations/delete').subscribe((response:any) => {
        });
        this.categoryExtraction();
    }

    private deleteCorrelation(correlationId:number):void
    {
        this._statsDataService.deleteRestCallData('markets/panda-black/correlation/delete/', correlationId).subscribe((response:any) => {
        });
        this.categoryExtraction();
    }

    private editCorrelationInfo(id:number):void
    {
        this.categoryExtraction();
        this.editCorrelationId = id;
    }
}
