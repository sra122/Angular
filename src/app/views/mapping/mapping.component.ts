import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';

import { TerraOverlayComponent, TerraSelectBoxValueInterface } from '@plentymarkets/terra-components';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { StatsDataService } from '../stats-view/stats-view.service';
import { Translation, TranslationService } from 'angular-l10n';

interface CustomPropertyInterface
{
    name?:any;
    value?:any;
    category?:any;
    parentAttribute?:any;
}

interface CorrelationCatergoryInterface
{
    name?:any;
    id?:number;
}

interface PickedValueInterface
{
}

@Component({
    selector: 'mapping',
    template: require('./mapping.component.html'),
    styles:   [require('./mapping.component.scss')]
})

export class MappingComponent extends Translation implements OnInit
{
    @ViewChild('viewChildOverlayWithPrimaryButton') public viewChildOverlayWithPrimaryButton:TerraOverlayComponent;
    @ViewChild('viewChildOverlayStatic') public viewChildOverlayStatic:TerraOverlayComponent;
    public productStatus:any;
    public vendorAttributes:Array<CustomPropertyInterface> = [];
    public vendorAttributeValues:Array<CustomPropertyInterface> = [];
    public _pickedValue:Array<PickedValueInterface> = [];
    public _mappedAttributes:Array<CustomPropertyInterface> = [];
    public correlationCategories:Array<CorrelationCatergoryInterface> = [];

    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();
    private _pickedCategoryValue:number;
    private _requestedForMapping:boolean;
    private _mappingPropertyData:any = [];
    private _mappingPropertyValueData:any = [];
    private _relativePropertyValues:any = [];

    private _selectableOptionTypesList:Array<TerraSelectBoxValueInterface> = [];
    private _selectablePropertyValueList:Array<TerraSelectBoxValueInterface> = [];
    private _categoryOptionTypesList:Array<TerraSelectBoxValueInterface> = [];

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService)
    {
        super();
        this._isLoading = false;
        this._requestedForMapping = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
        this.productStatus = '';

    }

    public ngOnInit(categoryId:number = 0):void
    {
        this._selectableOptionTypesList.push({
                value: 'default',
                caption: 'select one'
        });

        this._selectablePropertyValueList.push({
                value: 'default',
                caption: 'select one'
        });

        this.getPMProperties();
        this.getPMPropertyValues();
        this.getVendorCategories();
        this.notifications();

        this._mappedAttributes.push(
            {
                name: 'Kategorie',
                value: 'Create Automatically'
            }
        );
    }

    public savePropertyMapping():any
    {
        let mappingInfo:any = [];

        for(let key in this._pickedValue)
        {
            if(this._pickedValue.hasOwnProperty(key)) {
                mappingInfo[key] = this._pickedValue[key];
            }
        }

        this._statsDataService.postMappingInformation(Object.assign({}, mappingInfo), this._pickedCategoryValue).subscribe((mappingResponse:any) => {
        });
    }

    public getMappingInfo():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/mapping-data').subscribe((response:any) => {

            for(let attributeName in response.property)
            {
                if(response.property.hasOwnProperty(attributeName)) {
                    this._mappingPropertyData[attributeName] = response.property[attributeName];
                }
            }

            for(let attributeValueName in response.propertyValue)
            {
                if(response.propertyValue.hasOwnProperty(attributeValueName)) {
                    this._mappingPropertyValueData[attributeValueName] = response.propertyValue[attributeValueName];
                }
            }
        });
    }

    public onCategoryChange():any
    {
        this._requestedForMapping = false;
    }

    public savePBCategoryAsProperty():any
    {
        this.getMappingInfo();
        const categoryNameChanged:string = 'categoryNameChanged';
        this._requestedForMapping = true;
        this.vendorAttributes = [];
        this.vendorAttributeValues = [];
        this.correlationCategories = [];
        this.correlationCategories.push({
            name: this.getPBCategoryName(this._pickedCategoryValue),
            id: this._pickedCategoryValue
        });

        this._statsDataService.postPbCategory(this.getPBCategoryName(this._pickedCategoryValue)).subscribe((pbCategoryCreated:any) => {
            if(pbCategoryCreated === categoryNameChanged) {
                this.alert.addAlert({
                    msg: 'Please don\'t change the Category Name.',
                    type: 'warning',
                    dismissOnTimeout: 5000
                });
            } else {
                this._statsDataService.getRestCallData(
                    'markets/panda-black/vendor-attribute/' + this._pickedCategoryValue ).subscribe((attributes:any) => {
                    for(let k in attributes) {
                        if(attributes.hasOwnProperty(k)) {
                            if(attributes[k].required) {
                                if(this._mappingPropertyData.hasOwnProperty(attributes[k].name)) {
                                    this.vendorAttributes.push({
                                       name: attributes[k].name,
                                       value: this._mappingPropertyData[attributes[k].name]
                                    });
                                } else {
                                    this.vendorAttributes.push({
                                        name: attributes[k].name
                                    });
                                }
                                let result:any = Object.keys(attributes[k].values).map(function(key:any):any {
                                    return attributes[k].values[key];
                                });

                                for(let attributeValue of result) {
                                    if(this._mappingPropertyValueData.hasOwnProperty(attributeValue)) {
                                        this.vendorAttributeValues.push({
                                            name: attributeValue,
                                            parentAttribute: attributes[k].name,
                                            value: this._mappingPropertyValueData[attributeValue]
                                        });
                                    } else {
                                        this.vendorAttributeValues.push({
                                            name: attributeValue,
                                            parentAttribute: attributes[k].name
                                        });
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    public onSelectChangeAttribute(event:any, attributeName:any):any{
        this._pickedValue[attributeName + '-attribute'] = event;
    }

    public onSelectChangeAttributeValue(event:any, attributeValueName:any, attributeName:any):any {
        this._pickedValue[attributeValueName + '~' + attributeName] = event;
    }


    public notifications():any {
        this._statsDataService.getRestCallData('markets/panda-black/notifications').subscribe((notification:any) => {
            console.log(notification);
        });
    }

    private getVendorProperties():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/correlations').subscribe((response:any) =>
        {
            for(let category of response.entries)
            {
                let vendorId:any = category.settings[0].vendorCategory[0].id;

                this.correlationCategories.push({
                    name: category.settings[0].vendorCategory[0].name,
                    id: category.settings[0].vendorCategory[0].id
                });

                this._statsDataService.getRestCallData(
                    'markets/panda-black/vendor-attribute/' + vendorId ).subscribe((attributes:any) => {
                    for(let k in attributes) {
                        if(attributes.hasOwnProperty(k)) {
                            if(attributes[k].required) {
                                this.vendorAttributes.push({
                                    name: attributes[k].name,
                                    category: category.settings[0].vendorCategory[0].name
                                });

                                let result:any = Object.keys(attributes[k].values).map(function(key:any):any {
                                    return attributes[k].values[key];
                                });

                                for(let attributeValue of result) {
                                    this.vendorAttributeValues.push({
                                        name: attributeValue,
                                        category: category.settings[0].vendorCategory[0].name,
                                    });
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    private getVendorCategories():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/vendor-categories1').subscribe((categories:any) => {
            for(let categoryKey in categories) {
                if(categories.hasOwnProperty(categoryKey)) {
                    this._categoryOptionTypesList.push({
                        value: categoryKey,
                        caption: categories[categoryKey]
                    });
                }
            }
        });
    }


    private getPMProperties():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/pm-properties').subscribe((response:any) =>
        {
            for(let property of response) {
                this._selectableOptionTypesList.push({
                    value: property,
                    caption: property
                });
            }

            this._selectableOptionTypesList.push({
                value: 'Create Automatically',
                caption: 'Create Automatically'
            });
        });
    }


    private getPMPropertyValues():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/pm-property-values').subscribe((response:any) => {

            for(let propertyValue of response) {
                this._selectablePropertyValueList.push({
                    value: propertyValue,
                    caption: propertyValue
                });
            }

            this._selectablePropertyValueList.push({
                value: 'Create Automatically',
                caption: 'Create Automatically'
            });
        });
    }

    private getPBCategoryName(categoryId:number):any
    {
        for(let key in this._categoryOptionTypesList) {
            if(this._categoryOptionTypesList[key].value === categoryId) {
                return this._categoryOptionTypesList[key].caption;
            }
        }
        return false;
    }
}
