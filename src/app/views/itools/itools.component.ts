import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';
import { TerraOverlayComponent } from '@plentymarkets/terra-components';
import { TerraOverlayButtonInterface } from '@plentymarkets/terra-components';
import { TerraAlertComponent } from '@plentymarkets/terra-components';
import { TerraSelectBoxValueInterface} from '@plentymarkets/terra-components';
import {StatsDataService} from "../stats-view/stats-view.service";
import {Translation, TranslationService} from "angular-l10n";

@Component({
    selector: 'itools',
    template: require('./itools.component.html'),
    styles:   [require('./itools.component.scss')]
})
export class ItoolsComponent extends Translation implements OnInit
{
    @ViewChild('viewChildOverlayWithPrimaryButton') public viewChildOverlayWithPrimaryButton:TerraOverlayComponent;
    @ViewChild('viewChildOverlayStatic') public viewChildOverlayStatic:TerraOverlayComponent;

    private _isLoading:boolean;
    private _alert:TerraAlertComponent;
    private _lastUiId:number;

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

    private getLoginUrl():void
    {

        this._isLoading = true;

        this._statsDataService.getRestCallData('markets/panda-black/login-url').subscribe(
            (plentyResponse:any) =>
            {
                this._statsDataService.postPbCallData('/oauth2/authorizeSession').subscribe(
                    (response:any) =>
                    {
                        // todo: save the session timestamp in system

                        let popup:any = window.open(
                            process.env.PB_API_URL + '/oauth2/authorize?app_id=' +
                            process.env.PB_APP_ID + '&redirect=' +
                            plentyResponse.loginUrl
                            + '&session_id=' + response.Response.session_id,
                            'Panda Black',
                            'toolbar=no, location=#, directories=no, status=no, ' +
                            'menubar=no, scrollbars=yes, resizable=no, copyhistory=no, ' +
                            'width=600, height=600, top=0, left=50'
                        );

                        let pollTimer:any = window.setInterval(() =>
                        {
                            if(popup.closed !== false)
                            {
                                window.clearInterval(pollTimer);

                                this._isLoading = false;
                            }
                        }, 200);
                    }
                );
            }
        );
    }
}
