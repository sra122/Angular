import {
    Component, Input,
    OnInit
} from '@angular/core';
import { StatsDataService } from './stats-view.service';
import { TerraAlertComponent, TerraLeafInterface, TerraMultiSplitViewInterface } from '@plentymarkets/terra-components';
import { Translation, TranslationService } from 'angular-l10n';

import { isNullOrUndefined } from 'util';

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
    subLeafList?:Array<CategoryInterface>;
}

interface VendorCategoryCorrelationInterface
{
    category?:CategoryInterface;
    vendorCategory?:VendorCategoriesInterface;
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

    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private _isLoading:boolean;

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService)
    {
        super(translation);

        this._isLoading = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
    }

    public ngOnInit():void
    {
    }

    public categoryExtraction():void
    {
        this.getCategories();
        this.getVendorCategories();
        /*this._isLoading = true;

        this._loadingConfig.callLoadingEvent(true);

        Observable.combineLatest(
            this._categoriesService.getCategories(),
            this._vendorCategoriesService.getVendorCategories(),
            this._vendorCategoriesService.getCorrelations(),
            (categories:any, vendorCategories:any, vendorCategoryCorrelations:any) =>
            {
                return {
                    categories: categories,
                    vendorCategories: vendorCategories,
                    vendorCategoryCorrelations: vendorCategoryCorrelations
                };
            }
        ).subscribe(
            (data:any) => {
                data.vendorCategoryCorrelations.forEach((vendorCategoryCorrelation:VendorCategoriesCorrelationInterface) => {
                    this._lastUiId++;

                    this.vendorCategoriesCorrelation.push({
                        uiId: this._lastUiId,
                        vendorCategory: vendorCategoryCorrelation.vendorCategory,
                        category: vendorCategoryCorrelation.category
                    });
                });

                this._editSplitViewConfig.addView({
                    module: VendorCategoriesListModule.forRoot(),
                    defaultWidth: 'col-xs-12 col-md-4 col-lg-3',
                    focusedWidth: 'col-xs-12 col-md-12 col-lg-12',
                    name: this.translation.translate('vendorCategories.splitViewNames.correlations'),
                    mainComponentName: VendorCategoriesListModule.getMainComponent(),
                    isBackgroundColorGrey: true,
                    inputs: [
                        {
                            name: 'vendorCategories',
                            value: data.vendorCategories
                        },
                        {
                            name: 'categories',
                            value: data.categories
                        },
                        {
                            name: 'vendorCategoryCorrelations',
                            value: this.vendorCategoriesCorrelation
                        }
                    ]
                }, this.splitViewInstance);

                this._isLoading = false;

                this._loadingConfig.callLoadingEvent(false);
            },
            (error:any) =>
            {
                this._loadingConfig.callLoadingEvent(false);
                this._isLoading = false;
                let message:any =  error.json();
                this._alertConfig.callStatusEvent(message.error.code + ' ' + message.error.message, 'danger');
            });*/
    }

    private getCategories():void
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

    private getCategory(id:number):void
    {
        this.category = {};
        this._statsDataService.getRestCallData('markets/panda-black/parent-categories/' + id).subscribe((response:any) =>
        {
            console.log(response);
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
                                this.vendorCategoriesCorrelation = {
                                    category: category
                                };
                                this.getCategory(category.id);
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
            isOpen:false,
            clickFunction: ():void =>
                            {
                                console.log(category);
                            }
        };

        if(!isNullOrUndefined(category.children))
        {
            if(category.children.length > 0)
            {
                vendorLeafData.icon = 'icon-folder';
            } else {
                vendorLeafData.subLeafList = [];
            }
            category.children.forEach((child:any) =>
            {
                vendorLeafData.subLeafList.push(this.getVendorChildCategories(child));
            });
        }

        return vendorLeafData;
    }


    private createCorrelation():void
    {
        let vendorCategoryName:string;
        let categoryName:string;

        console.log(this.vendorCategoriesCorrelation.vendorCategory);
        console.log(this.vendorCategoriesCorrelation.category);

        if(!isNullOrUndefined(this.vendorCategoriesCorrelation.vendorCategory.name))
        {
            vendorCategoryName = this.vendorCategoriesCorrelation.vendorCategory.name;
        } else {
            vendorCategoryName = '?';
        }

        if(!isNullOrUndefined(this.vendorCategoriesCorrelation.category.caption))
        {
            categoryName = this.vendorCategoriesCorrelation.category.caption;
        } else {
            categoryName = '?';
        }

        console.log(vendorCategoryName + ' ' + categoryName);
    }

}
