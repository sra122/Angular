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

    public postRestCallData(taxonomyCorrelations:Array<any>):Observable<void>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'markets/panda-black/correlations';

        return this.mapRequest(
            this.http.post(url,
                {
                    correlations: taxonomyCorrelations
                }, {
                    headers: this.headers,
                })
        );
    }

    public postAttributeData(attributeName:string):any
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'markets/panda-black/attribute';

        return this.mapRequest(
            this.http.post(url,
                {
                    new_attribute: attributeName
                }, {
                    headers: this.headers
                })
        );
    }

    public postAttributeMapping(vendorAttribute:string, plentyMarketAttribute:string):any
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'markets/panda-black/attribute-mapping';

        return this.mapRequest(
            this.http.post(url,
                {
                    vendor_attribute: vendorAttribute,
                    plenty_attribute: plentyMarketAttribute
                }, {
                    headers: this.headers
                })
        );
    }

    public deleteRestCallData(restRoute:string, id:number = null):Observable<void>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = '';
        if(id === null) {
            url = this.url + restRoute;
        } else {
            url = this.url + restRoute + id;
        }
        return this.mapRequest(
            this.http.delete(url,
                {
                    headers: this.headers
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
