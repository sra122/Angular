import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';

import { TerraOverlayComponent, TerraSelectBoxValueInterface, TerraAlertComponent } from '@plentymarkets/terra-components';
import { StatsDataService } from '../stats-view/stats-view.service';
import { Translation, TranslationService } from 'angular-l10n';
import { isBoolean, isNullOrUndefined, isNumber } from 'util';

interface CustomPropertyInterface
{
    name?:any;
    value?:any;
    category?:any;
    parentAttribute?:any;
    attributeId?:any;
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
    @ViewChild('propertyValueMapping') public propertyValueMapping:TerraOverlayComponent;
    public productStatus:any;
    public vendorAttributes:Array<CustomPropertyInterface> = [];
    public vendorAttributeValues:Array<CustomPropertyInterface> = [];
    public _pickedValue:Array<PickedValueInterface> = [];
    public correlationCategories:Array<CorrelationCatergoryInterface> = [];

    private _isLoading:boolean;
    private _lastUiId:number;
    private _alert:TerraAlertComponent = TerraAlertComponent.getInstance();
    private _pickedCategoryValue:number;
    private _requestedForMapping:boolean;
    private _attributeValueChange:boolean;
    private _attributesChange:boolean;
    private _mappingPropertyData:any = [];
    private _mappingPropertyValueData:any = [];
    private attributesInfo:any = [];
    private relatedAttributes:any = [];
    private propertyValues:any = [];

    private _selectableOptionTypesList:Array<TerraSelectBoxValueInterface> = [];
    private _selectablePropertyValueList:Array<TerraSelectBoxValueInterface> = [];
    private _categoryOptionTypesList:Array<TerraSelectBoxValueInterface> = [];

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService)
    {
        super();
        this._isLoading = false;
        this._requestedForMapping = false;
        this._attributeValueChange = false;
        this._attributesChange = false;
        this._lastUiId = 0;
        this.productStatus = '';
    }

    public ngOnInit(categoryId:number = 0):void
    {
        this._selectableOptionTypesList = [];
        this._selectablePropertyValueList = [];

        this.getPMProperties();
        this.getPMPropertyValues();
        this.getVendorCategories();
        if(categoryId === 1) {
            this.savePBCategoryAsProperty();
        }
    }

    public testAlert():void
    {
        this._alert.addAlert({
            msg:              'info-Alert',
            type:             'info',
            dismissOnTimeout: 5000,
            identifier:       'info'
        });
    }

    /**
     *
     * @param attributeId
     * @param propertyMapping
     * @param attributeName
     */
    public savePropertyMapping(attributeId:number, propertyMapping:boolean, attributeName:string = null):any
    {
        let mappingInfo:any = [];

        /* If Seller is trying to Proceed further before creating Property Mapping. */
        if((propertyMapping === true) && (attributeName === null)) {
            this._alert.addAlert( {
                msg:   'Please create Property Before proceeding to Property Values',
                type:  'danger',
                dismissOnTimeout: 50000
            });
            return;
        }

        for(let key in this._pickedValue)
        {
            if(this._pickedValue.hasOwnProperty(key)) {
                mappingInfo[key] = this._pickedValue[key];
            }
        }

        this._statsDataService.postMappingInformation(Object.assign({}, mappingInfo), this._pickedCategoryValue).subscribe((mappingResponse:any) => {
        });

        if(propertyMapping === false)
        {
            this.propertyValueMapping.hideOverlay();
            this._alert.addAlert({
                msg:              'Information is Saved.',
                type:             'success',
                dismissOnTimeout: 5000
            });
        }

        if(propertyMapping === true)
        {
            this.relatedAttributes = [];

            for(let attribute of this.attributesInfo)
            {
                if(attribute.attributeId === attributeId)
                {
                    this.relatedAttributes.push(attribute);
                }
            }

            this._selectablePropertyValueList = [];

            /*for(let propertyValue of this.propertyValues) {
                if((propertyValue.split('-')).reverse()[0] === attributeName) {
                    propertyValue = propertyValue.replace('-' + attributeName, '');
                    this._selectablePropertyValueList.push({
                        value: propertyValue,
                        caption: propertyValue
                    });
                }
            }*/

            for(let propertyValue of this.propertyValues) {
                if((propertyValue.split('-')).reverse()[0] === mappingInfo[attributeName + '-attribute']) {
                    propertyValue = propertyValue.replace('-' + mappingInfo[attributeName + '-attribute'], '');
                    this._selectablePropertyValueList.push({
                        value: propertyValue,
                        caption: propertyValue
                    });
                }
            }

            this._selectablePropertyValueList.push({
                value: 'Create Automatically',
                caption: this.translation.translate('mapping.create-automatically'),
            });
            this._selectablePropertyValueList = this._selectablePropertyValueList.sort();
            this.propertyValueMapping.showOverlay();
        }
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
        this._requestedForMapping = true;
        this.vendorAttributes = [];
        this.vendorAttributeValues = [];
        /*this.correlationCategories = [];*/
        this.attributesInfo = [];
        /*this.correlationCategories.push({
            name: this.getPBCategoryName(this._pickedCategoryValue),
            id: this._pickedCategoryValue
        });*/

        let pbCategoryName:any = this.getPBCategoryName(this._pickedCategoryValue);
        if(!isBoolean(pbCategoryName)) {
            this._statsDataService.postPbCategory(pbCategoryName).subscribe((pbCategoryCreated:any) => {
                if(isNumber(pbCategoryCreated)) {
                    this._statsDataService.getRestCallData(
                        'markets/panda-black/vendor-attribute/' + this._pickedCategoryValue).subscribe((attributes:any) => {
                        for(let k in attributes) {
                            if(attributes.hasOwnProperty(k)) {
                                if(attributes[k].required && !isNullOrUndefined(attributes[k].values)) {
                                    if(this._mappingPropertyData.hasOwnProperty(attributes[k].name)) {
                                        this.vendorAttributes.push({
                                            name: attributes[k].name,
                                            value: this._mappingPropertyData[attributes[k].name],
                                            attributeId: k
                                        });
                                    } else {
                                        this.vendorAttributes.push({
                                            name: attributes[k].name,
                                            attributeId: k
                                        });
                                    }
                                    let result:any = Object.keys(attributes[k].values).map(function(key:any):any {
                                        return attributes[k].values[key];
                                    });

                                    for(let attributeValue of result) {
                                        if(this._mappingPropertyValueData.hasOwnProperty(attributeValue)) {
                                            this.attributesInfo.push({
                                                name: attributeValue,
                                                parentAttribute: attributes[k].name,
                                                value: this._mappingPropertyValueData[attributeValue],
                                                attributeId: k
                                            });
                                        } else {
                                            this.attributesInfo.push({
                                                name: attributeValue,
                                                parentAttribute: attributes[k].name,
                                                attributeId: k
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
    }

    public onSelectChangeAttribute(event:any, attributeName:any):any{
        this._pickedValue[attributeName + '-attribute'] = event;
        this._attributesChange = true;
    }

    public onSelectChangeAttributeValue(event:any, attributeValueName:any, attributeName:any):any {
        this._pickedValue[attributeValueName + '~' + attributeName] = event;
    }

    private getVendorCategories():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/vendor-categories').subscribe((categories:any) => {
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
                caption: this.translation.translate('mapping.create-automatically')
            });

            this._selectableOptionTypesList = this._selectableOptionTypesList.sort();
        });
    }

    private getPMPropertyValues():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/pm-property-values').subscribe((response:any) => {
            this.propertyValues = response;
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
