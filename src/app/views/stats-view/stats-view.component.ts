import {
    Component, Input,
    OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { StatsDataService } from './stats-view.service';
import {
    TerraAlertComponent, TerraLeafInterface, TerraMultiSplitViewInterface, TerraOverlayButtonInterface,
    TerraOverlayComponent,
    TerraSelectBoxValueInterface, TerraSimpleTableCellInterface, TerraSimpleTableHeaderCellInterface,
    TerraSimpleTableRowInterface
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
    private _selectableVendorCategoriesList:Array<TerraSelectBoxValueInterface> = [];

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
    private appendEditCorrelation:number = 0;

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService,
                public _vendorCategories:VendorCategoriesService,
                private _loadingConfig:LoadingConfig,
                viewContainerRef:ViewContainerRef)
    {
        super(translation);

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
        this.appendEditCorrelation = 0;
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
        this.getParentCategories();
        this.getVendorCategories();
        this.getCorrelation();
    }

    private getParentCategories():void
    {
        this.categories = [];
        this._statsDataService.getRestCallData('markets/panda-black/parent-categories').subscribe((response:any) =>
        {
            for(let category of response.categoryDetails)
            {
                this.categories.push(this.getChildCategories(category));
            }
        });
    }

    private getParentCategory(id:number):void
    {
        this.category = {};
        this._statsDataService.getRestCallData('markets/panda-black/parent-categories/' + id).subscribe((response:any) =>
        {
        });
    }

    private getChildCategories(category:CategoriesInterface):TerraLeafInterface
    {
        this.vendorCategoriesCorrelation = {};

        let leafData:TerraLeafInterface = {
            caption: category.details[0].name,
            id: category.id,
            icon:null,
            subLeafList:null,
            isOpen: false,
            clickFunction:  ():void =>
                            {
                                this.categoryArray = [];
                                this.categoryArray.push(category);
                                this.getParentCategory(category.id);
                                this.createCorrelation();
                            }
        };

        if(!isNullOrUndefined(category.children))
        {
            leafData.icon = 'icon-folder';
            leafData.subLeafList = [];
            category.children.forEach((child:any) =>
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
            clickFunction: ():void =>
                            {
                                this.vendorCategoryArray = [];
                                this.vendorCategoryArray.push(category);
                                this.createCorrelation();
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
               if(count <= 0)
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
               }
           }
        }
    }

    private createCorrelationMapping():void
    {
        this.vendorCategoriesCorrelationArray.push(this.attributeMappingRecord);
        this._statsDataService.postRestCallData(this.vendorCategoriesCorrelationArray);
        this.vendorCategoryArray.splice(0, 1);
        this.categoryArray.splice(0, 1);
        this.categoryExtraction();
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

            this._selectableOptionTypesList.push({
               value: 'create_attribute',
               caption: 'Create Attribute'
            });
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
            dismissOnTimeout: 0
        });

        if(response === true) {
            this.createCorrelationMapping();
        }

    }

    private vendorAttributeMapping(plentyAttribute:string, vendorAttribute:string):any
    {
        if(plentyAttribute === 'create_attribute') {
            this.openOverlayForAttributeCreation();
        } else {
            this._statsDataService.postAttributeMapping(plentyAttribute, vendorAttribute).subscribe((response:any) => {
                this.attributeMappingRecord.push(response);
            });
        }
    }

    private deleteAllCorrelations():void
    {
        this._statsDataService.deleteRestCallData('markets/panda-black/correlations');
        this.categoryExtraction();
    }

    private createPlentyMarketAttribute(attributeName:string):any
    {
        this._statsDataService.postAttributeData(attributeName);
    }

    private deleteCorrelation(correlationId:number):void
    {
        this._statsDataService.deleteRestCallData('markets/panda-black/correlation/', correlationId);
        this.categoryExtraction();
    }

    private selectedPlentyAttribute(event:any):any {
        this.selectedValue = event.target.value;
    }

    private editCorrelation(id:number):void
    {
        this.categoryExtraction();
        this.appendEditCorrelation = id;
        if(isNullOrUndefined(this.attributeMappingRecord)) {
        } else {
            this.vendorCategoriesCorrelationArray.push(this.attributeMappingRecord);
            this._statsDataService.editCorrelation(this.vendorCategoriesCorrelationArray, id);
            this.vendorCategoryArray.splice(0, 1);
            this.categoryArray.splice(0, 1);
        }
    }
}
