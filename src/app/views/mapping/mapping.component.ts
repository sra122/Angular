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
    public testArray:Array<CustomPropertyInterface> = [];
    public _pickedValue:any;
    public _mappedAttributes:Array<CustomPropertyInterface> = [];

    public _expireTime:any;
    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;
    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();

    private _selectableOptionTypesList:Array<TerraSelectBoxValueInterface> = [];

    constructor(private _statsDataService:StatsDataService,
                public translation:TranslationService)
    {
        super();
        this._isLoading = false;

        this._alert = TerraAlertComponent.getInstance();

        this._lastUiId = 0;
        this._pickedValue = {};
        this.productStatus = '';

    }

    public ngOnInit():void
    {
        //this.getProperties();
        this._selectableOptionTypesList.push(
            {
              value: 'default',
              caption: 'select one'
            },
            {
                value: 'marken',
                caption: 'Marken'
            },
            {
                value: 'gewicht',
                caption:'Gewicht'
            },
            {
                value: 'farbe',
                caption:'Farbe'
            }
        );

        this.testArray.push(
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
        );

        this._mappedAttributes.push(
            {
                name: 'Brand',
                value: 'marken'
            }
        );
        console.log(this._pickedValue);
    }

    public savePropertyMapping():any
    {
        console.log(this._pickedValue);
    }

    public onSelectChange(event:any, name:any):any{
        this._pickedValue[name] = event;
    }

    private getProperties():any
    {
        this._statsDataService.getRestCallData('markets/panda-black/vendor-attribute').subscribe((response:any) => {
           console.log(response);
        });
    }
}
