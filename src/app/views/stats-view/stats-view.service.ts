import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import {
    TerraBaseService,
    TerraLoadingSpinnerService
} from '@plentymarkets/terra-components';
import { isNullOrUndefined } from 'util';


@Injectable()
export class StatsDataService extends TerraBaseService
{
    private bearer:string;

    constructor(private _loadingSpinnerService:TerraLoadingSpinnerService,
                private _http:Http)
    {
        super(_loadingSpinnerService, _http, '/rest/');

        if(process.env.ENV !== 'production')
        {
            this.bearer = process.env.TOKEN;
            this.url = process.env.BASE_URL + this.url;
        }
    }

    public getRestCallData(restRoute:string):Observable <Array<any>>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + restRoute;

        return this.mapRequest(
            this.http.get(url, {
                headers: this.headers,
                body:    ''
            })
        );
    }

    private setHeader():void
    {
        if(!isNullOrUndefined(this.bearer))
        {
            this.headers.set('Authorization', 'Bearer ' + this.bearer);
        }
    }
}
