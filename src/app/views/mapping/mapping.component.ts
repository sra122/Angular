import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';

import { Pipe, PipeTransform } from '@angular/core';
import { TerraOverlayComponent, TerraSelectBoxValueInterface } from '@plentymarkets/terra-components';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { StatsDataService } from '../stats-view/stats-view.service';
import { Translation, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

interface CustomPropertyInterface
{
    name?:any;
    value?:any;
    category?:any;
}

interface CorrelationCatergoryInterface
{
    name?:any;
    id?:number;
}

interface PickedValueInterface
{
    id?:number;
    pbAttribute?:any;
    pmAttribute?:any;
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

    private _selectableOptionTypesList:Array<TerraSelectBoxValueInterface> = [];
    private _selectablePropertyValueList:Array<TerraSelectBoxValueInterface> = [];

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
        this._selectableOptionTypesList.push(
            {
                value: 'default',
                caption: 'select one'
            }
        );

        this._selectablePropertyValueList.push(
            {
                value: 'default',
                caption: 'select one'
            }
        );

        this.getVendorProperties();
        this.getPMProperties();
        this.getPMPropertyValues();

        /*this.testArray.push(
            {
                name: 'Brand',
                value: 'marken'
            },
            {
                name: 'Color'
            },
            {
                name: 'Weight'
            }
        );*/

        this._mappedAttributes.push(
            {
                name: 'Brand',
                value: 'marken'
            }
        );
    }

    public savePropertyMapping(categoryId:number):any
    {
        console.log(categoryId);
        console.log(this._pickedValue);
    }

    public onSelectChange(event:any, name:any, categoryId:number):any{
        this._pickedValue.push({
           id: categoryId,
           pbAttribute : event,
           pmAttribute : name
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
                                for(let attributeValue of attributes[k].values) {
                                    this.vendorAttributeValues.push({
                                        name: attributeValue,
                                        category: category.settings[0].vendorCategory[0].name
                                    });
                                    console.log(attributeValue);
                                }
                            }
                        }
                    }
                });
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
        });
    }
}
