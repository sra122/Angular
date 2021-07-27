import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { StatsDataService } from '../stats-view/stats-view.service';
import { Translation } from 'angular-l10n';

@Component({
    selector: 'token',
    styleUrls: ['./token.component.scss'],
    templateUrl: './token.component.html'
})
export class TokenComponent extends Translation implements OnInit{
    public _username:string;
    public _password:string;
    private _isLoading:boolean;

    constructor(private _statsDataService:StatsDataService)
    {
        super();
        this._isLoading = false;
    }

    public ngOnInit():void {
        this._isLoading = false;
    }

    public sendToken():void {
        this._statsDataService.postForToken(this._username, this._password).subscribe((response:any) => {
            console.log(response);
        });
    }
}
