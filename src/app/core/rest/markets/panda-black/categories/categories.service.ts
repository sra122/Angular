import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {
    TerraLoadingSpinnerService,
    TerraBaseService
} from '@plentymarkets/terra-components';
import { Observable } from 'rxjs';
import { TranslationService } from 'angular-l10n';
import { CategoryInterface } from './data/categories.interface';
import { isNullOrUndefined } from 'util';

@Injectable()
export class CategoriesService extends TerraBaseService
{
    private bearer:string;

    constructor(loadingBarService:TerraLoadingSpinnerService,
                http:Http,
                public translation:TranslationService)
    {
        super(loadingBarService, http, 'markets/panda-black/parent-categories');

        if(process.env.ENV !== 'production')
        {
            this.bearer = process.env.TOKEN;
            this.url = process.env.BASE_URL + this.url;
        }
    }

    public getCategory(id:number):Observable<CategoryInterface>
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

    public getCategories():Observable<Array<CategoryInterface>>
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

    private setHeader():void
    {
        if(!isNullOrUndefined(this.bearer))
        {
            this.headers.set('Authorization', 'Bearer' + this.bearer);
        }
    }
}
