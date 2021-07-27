import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    TerraBaseService,
    TerraLoadingSpinnerService
} from '@plentymarkets/terra-components';
import { isBoolean, isNullOrUndefined } from 'util';

@Injectable()
export class StatsDataService extends TerraBaseService
{

    public randId = new Date().getTime();
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

        let url:string = this.url + restRoute + '?' + this.randId;

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

        let url:string = this.url + 'markets/panda-black/create-correlation?' + this.randId;

        return this.mapRequest(
            this.http.post(url,
                {
                    correlations: taxonomyCorrelations
                }, {
                    headers: this.headers,
                })
        );
    }

    public editCorrelation(taxonomyCorrelations:Array<any>, id:number = null):any
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'markets/panda-black/edit-correlations?' + this.randId;

        return this.mapRequest(
            this.http.post(url,
                {
                    correlations: taxonomyCorrelations,
                    id: id
                }, {
                    headers: this.headers,
                })
        );
    }


    public postAttribute(id:number):any
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + 'markets/panda-black/create-attribute/' + id + '?' + this.randId;

        return this.mapRequest(
            this.http.post(url,
                {
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
            url = this.url + restRoute + '?' + this.randId;
        } else {
            url = this.url + restRoute + id + '?' + this.randId;
        }
        return this.mapRequest(
            this.http.delete(url,
                {
                    headers: this.headers
                })
        );
    }

    public postPbProducts(restRoute:string):Observable<void>
    {
        this.setAuthorization();
        this.setHeader();

        let url:string = this.url + restRoute + '?' + this.randId;

        return this.mapRequest(
            this.http.post(url,
                {
                }, {
                    headers: this.headers
                })
        );
    }

    public postPbCallData(restRoute:string):Observable<void>
    {
        this.headers.set('APP-ID', process.env.PB_APP_ID);
        let url:string = process.env.PB_API_URL +  restRoute + '?' + this.randId;

        return this.mapRequest(
            this.http.post(url,
                {
                }, {
                    headers: this.headers,
                })
        );
    }

    public postPbSession():Observable<any>
    {
        let url:string = this.url + 'markets/panda-black/session?' + this.randId;

        return this.mapRequest(
            this.http.post(url,
                {
                }, {
                    headers: this.headers
                })
        );
    }


    public postPbCategory(pbCategoryTitle:any):Observable<void>
    {
        if(!isBoolean(pbCategoryTitle)) {
            this.headers.set('APP-ID', process.env.PB_APP_ID);
            let url:string = this.url + 'markets/panda-black/create-category-as-property?' + this.randId;

            return this.mapRequest(
                this.http.post(url, {
                    categoryName: pbCategoryTitle
                }, {
                    headers: this.headers
                })
            );
        }
    }


    public postMappingInformation(mappingInformation:any, pbCategoryId:any):Observable<void>
    {
        this.headers.set('APP-ID', process.env.PB_APP_ID);

        let url:string = this.url + 'markets/panda-black/mapping?' + this.randId;

        return this.mapRequest(
            this.http.post(url, {
                mappingInformation: mappingInformation,
                categoryId: pbCategoryId
            }, {
                headers: this.headers
            })
        );
    }


    public postRemoveNotification(propertyName:any, notificationType:string):Observable<void>
    {
        this.headers.set('APP-ID', process.env.PB_APP_ID);

        let url:string = this.url + 'markets/panda-black/remove-notification?' + this.randId;

        return this.mapRequest(
            this.http.post(url, {
                notificationType: notificationType,
                propertyName: propertyName
            }, {
                headers: this.headers
            })
        );
    }


    public postProduct():Observable<void>
    {
        this.headers.set('APP-ID', process.env.PB_APP_ID);

        let url:string = this.url + 'markets/panda-black/products-data?' + this.randId;

        return this.mapRequest(
            this.http.post(url, {
            }, {
                headers: this.headers
            })
        );
    }

    public postNotificationRead(id:number):Observable<void>
    {
        console.log('client');
        console.log(id);
        this.headers.set('APP-ID', process.env.PB_APP_ID);

        let url:string = this.url + 'markets/panda-black/mark-notification/' + id + '?' + this.randId;

        return this.mapRequest(
            this.http.post(url, {
            }, {
                headers: this.headers
            })
        );
    }


    public postForToken(username:string, password:string):Observable<void>
    {
        this.headers.set('APP-ID', process.env.PB_APP_ID);

        let url:string = this.url + 'markets/panda-black/token' + '?' + this.randId;

        return this.mapRequest(
            this.http.post(url, {
                username: username,
                password: password
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
