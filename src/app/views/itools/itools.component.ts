import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';
import { TerraOverlayComponent } from '@plentymarkets/terra-components';
import { TerraOverlayButtonInterface } from '@plentymarkets/terra-components';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { TerraSelectBoxValueInterface} from '@plentymarkets/terra-components';

@Component({
    selector: 'itools',
    template: require('./itools.component.html'),
    styles:   [require('./itools.component.scss')]
})
export class ItoolsComponent implements OnInit
{
    @ViewChild('viewChildOverlayWithPrimaryButton') public viewChildOverlayWithPrimaryButton:TerraOverlayComponent;
    @ViewChild('viewChildOverlayStatic') public viewChildOverlayStatic:TerraOverlayComponent;

    private _addButtonTooltip:string = 'Hinzufügen';
    private _name:string;

    private _primaryButtonInterface:TerraOverlayButtonInterface;

    private alert:TerraAlertComponent = TerraAlertComponent.getInstance();

    public ngOnInit():void
    {
        this.primaryButtonInterface = {
            icon:          'icon-confirm',
            caption:       'Sync',
            tooltipText:   this.addButtonTooltip,
            isDisabled:    false,
            clickFunction: ():void => this.primaryClicked(this.viewChildOverlayWithPrimaryButton)
        };
    }

    private openOverlayWithPrimaryButton():void
    {
        this.viewChildOverlayWithPrimaryButton.showOverlay();
    }

    private primaryClicked(overlay:TerraOverlayComponent):void
    {
        this.showValues();
        this.alert.addAlert({
            msg:              overlay.inputOverlayTitle + ' clicked',
            type:             'success',
            dismissOnTimeout: 0
        });
    }

    public get addButtonTooltip():string
    {
        return this._addButtonTooltip;
    }

    public get primaryButtonInterface():TerraOverlayButtonInterface
    {
        return this._primaryButtonInterface;
    }

    public set primaryButtonInterface(value:TerraOverlayButtonInterface)
    {
        this._primaryButtonInterface = value;
    }

    private showValues():void
    {
        //alert(this._name);
        let popup = window.open('https://www.google.com', '', 'toolbar=no, ' +
                    'location=#, directories=no, status=no, menubar=no, scrollbars=yes, ' +
                    'resizable=no, copyhistory=no, width=600, height=600, top=0, left=50' );
    }
}
