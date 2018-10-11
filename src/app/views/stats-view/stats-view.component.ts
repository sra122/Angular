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

import { isNullOrUndefined } from 'util';
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
    private vendorCategoryName:string;
    private categoryName:string;
    private categoryArray:Array<any>;
    private _viewContainerRef:ViewContainerRef;
    private attributeMappingRecord:Array<any>;
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();
    private selectedValue:string = '';
    private editCorrelationId:number = 0;
    private vendorParentCategory:Array<any>;

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
        this._viewContainerRef = viewContainerRef;
        this.attributeMappingRecord = [];
        this.editCorrelationId = 0;
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

    public openOverlayForAttributeCreation():void
    {
        this.viewChildOverlayAttribute.showOverlay();
    }

    public categoryExtraction():void
    {
        this.categoryMapping = [];
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
            isOpen: false,
            isActive: false,
            clickFunction:  ():void =>
            {
                this._statsDataService.getRestCallData('markets/panda-black/parent-categories/' + category.id).subscribe((response:any) =>
                {
                    this.categoryArray = [];
                    this.categoryArray.push(response);
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
            category.child.forEach((child:any) =>
            {
                leafData.subLeafList.push(this.getChildCategories(child));
            });
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
                                this.vendorCategoryArray.push(category);
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
                   this.vendorCategoriesCorrelation = {
                       category: this.categoryArray,
                       vendorCategory: this.vendorCategoryArray
                   };
                   if(this.vendorCategoriesCorrelationArray.length > 0) {
                       this.vendorCategoriesCorrelationArray = [];
                   }
                   this.vendorCategoriesCorrelationArray.push(this.vendorCategoriesCorrelation);
                   this.openOverlayForAttributeMapping();
                   this.attributeMapping(this.vendorCategoryArray[0]);
               } else {
                   this.alert.addAlert({
                       msg:              'This Category Mapping is already existed',
                       type:             'warning',
                       dismissOnTimeout: 5000
                   });
               }
           }
        }
    }

    private createCorrelationMapping():void
    {
        console.log(this.editCorrelationId);
        if(this.editCorrelationId === 0) {
            this.vendorCategoriesCorrelationArray.push(this.attributeMappingRecord);
            this._statsDataService.postRestCallData(this.vendorCategoriesCorrelationArray).subscribe((response:any) => {
                console.log(response);
            });
            this.vendorCategoryArray.splice(0, 1);
            this.categoryArray.splice(0, 1);
            this.categoryExtraction();
        } else {
            this.vendorCategoriesCorrelationArray.push(this.attributeMappingRecord);
            this._statsDataService.editCorrelation(this.vendorCategoriesCorrelationArray, this.editCorrelationId);
            this.vendorCategoryArray.splice(0, 1);
            this.categoryArray.splice(0, 1);
            this.editCorrelationId = 0;
            this.categoryExtraction();
        }
    }

    private attributeMapping(vendorCategoryData:any):void
    {
        this._selectableVendorCategoriesList = [];
        this._selectableOptionTypesList = [];
        vendorCategoryData.attributeValueSets.forEach(function(attribute:any):void {
            this._selectableVendorCategoriesList.push({
               value: attribute.displayName,
               caption: this._selectableVendorCategoriesList.length
            });
        }.bind(this));
        this._statsDataService.getRestCallData('markets/panda-black/attributes').subscribe((response:any) =>
        {
            for(let attribute of response.entries)
            {
                this._selectableOptionTypesList.push({
                    value: attribute.backendName,
                    caption: attribute.backendName
                });
            }
        });

        this._primaryButtonInterface = {
            icon:          'icon-confirm',
            caption:       'Confirm Mapping',
            isDisabled:    false,
            clickFunction: ():void => this.confirmMapping(true)
        };
    }

    private confirmMapping(response:boolean):void
    {
        this.alert.addAlert({
            msg:              'Mapping is created',
            type:             'success',
            dismissOnTimeout: 5000
        });

        if(response === true) {
            this.createCorrelationMapping();
        }
    }

    private vendorAttributeMapping(vendorAttribute:string, plentyAttribute:string):any
    {
        this._statsDataService.postAttributeMapping(vendorAttribute, plentyAttribute).subscribe((attributeId:any) => {
            this._statsDataService.getAttributeMapping(attributeId).subscribe((attributeMappingInfo:AttributeMappingInterface) => {
                this.attributeMappingRecord.push(attributeMappingInfo);
                this.alert.addAlert({
                    msg:              'Attribute Mapping is created',
                    type:             'success',
                    dismissOnTimeout: 5000
                });
            });
        });
    }

    private deleteAllCorrelations():void
    {
        this._statsDataService.deleteRestCallData('markets/panda-black/correlations').subscribe((response:any) => {
            console.log(response);
        });
        this.categoryExtraction();
    }

    private createPlentyMarketAttribute(attributeName:string, attributeValue:string):any
    {
        this._statsDataService.postAttributeData(attributeName, attributeValue).subscribe((response:any) => {
            if(!isNullOrUndefined(response)) {
                this.alert.addAlert({
                    msg:              'New Attribute is Created.',
                    type:             'success',
                    dismissOnTimeout: 5000
                });
            }
        });
        this.categoryExtraction();
    }

    private deleteCorrelation(correlationId:number):void
    {
        this._statsDataService.deleteRestCallData('markets/panda-black/correlation/delete/', correlationId).subscribe((response:any) => {
            console.log(response);
        });
    }

    private selectedPlentyAttribute(event:any):any {
        this.selectedValue = event.target.value;
    }

    private editCorrelationInfo(id:number):void
    {
        this.categoryExtraction();
        this.editCorrelationId = id;
        console.log(this.editCorrelationId);
    }
}
