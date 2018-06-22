import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {
    TerraLoadingSpinnerService,
    TerraBaseService
} from '@plentymarkets/terra-components';
import { Observable } from 'rxjs';
import { TranslationService } from 'angular-l10n';
import { VendorCategoriesInterface } from './data/vendor-categories.interface';
import { isNullOrUndefined } from 'util';

@Injectable()
export class VendorCategoriesService extends TerraBaseService
{
    private bearer:string;

    constructor(loadingBarService:TerraLoadingSpinnerService,
                http:Http,
                public translation:TranslationService)
    {
        super(loadingBarService, http, 'markets/panda-black/vendor-categories/');

        if(process.env.ENV !== 'production')
        {
            this.bearer = process.env.TOKEN;
            this.url = process.env.BASE_URL + this.url;
        }
    }

    public getVendorCategory(id:number):Observable<VendorCategoriesInterface>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + id;

        return this.mapRequest(
            this.http.get(url, {
                headers: this.headers,
                body: '',
                search: {
                    lang: this.translation.getLanguage(),
                    with: ['path']
                }
            })
        );
    }

    public getVendorCategories():Observable<Array<VendorCategoriesInterface>>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url;

        return this.mapRequest(
            this.http.get(url, {
                headers: this.headers,
                body:    '',
                search:  {
                    lang: this.translation.getLanguage(),
                    with: ['children']
                }
            })
        );
    }

    public saveCorrelations(taxonomyCorrelations:Array<any>):Observable<void>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = '/rest/markets/settings';

        return this.mapRequest(
            this.http.post(url, {
                taxonomyCorrelations
                }, {
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
