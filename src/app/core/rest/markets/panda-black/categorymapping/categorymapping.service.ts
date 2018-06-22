import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {
    TerraLoadingSpinnerService,
    TerraBaseService
} from '@plentymarkets/terra-components';
import { Observable } from 'rxjs';

import { isNullOrUndefined } from 'util';

@Injectable()
export class CategoryMappingService extends TerraBaseService
{
    private bearer:string;

    constructor(loadingBarService:TerraLoadingSpinnerService,
                http:Http)
    {
        super(loadingBarService, http, '/rest/');

        if(process.env.ENV !== 'production')
        {
            this.bearer = process.env.TOKEN;
            this.url = process.env.BASE_URL + this.url;
        }
    }

    public getCorrelations():Observable<Array<any>>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'markets/settings';

        return this.mapRequest(
            this.http.get(url, {
                headers: this.headers,
                body: ''
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
