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
        super(loadingBarService, http, '/rest/markets/panda-black/');

        if(process.env.ENV !== 'production')
        {
            this.bearer = process.env.TOKEN;
            this.url = process.env.BASE_URL + this.url;
        }
    }

    public saveCorrelations(taxonomyCorrelations:Array<any>):Observable<void>
    {
        console.log(taxonomyCorrelations);
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'correlations';

        return this.mapRequest(
            this.http.post(url,
                {
                    correlations: taxonomyCorrelations
                }, {
                    headers: this.headers,
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
