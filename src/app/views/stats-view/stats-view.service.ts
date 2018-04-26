import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import {
    TerraBaseService,
    TerraLoadingSpinnerService
} from '@plentymarkets/terra-components';

interface LoginInterface
{
    accessToken?:string;
    tokenType?:string;
}

@Injectable()
export class StatsDataService extends TerraBaseService
{
    public bearer:string;
    private _basePathUrl:string;
    private login:LoginInterface;
    constructor(private _loadingSpinnerService:TerraLoadingSpinnerService,
                private _http:Http)
    {
        super(_loadingSpinnerService, _http, '/rest/');
        this.authenticationPlentyMarkets();
    }

    public authenticationPlentyMarkets():void
    {
        if(process.env.ENV !== 'production')
        {
            this.loginData();
            // tslint:disable-next-line:max-line-length
            this._basePathUrl = 'https://i-ways.plentymarkets-cloud02.com';
            this.url = this._basePathUrl + this.url;
        }
    }

    public getRestCallData(restRoute:string):Observable <Array<any>>
    {
        this.setAuthorization();
        let url:string;
        url = this._basePathUrl + restRoute;
        return this.mapRequest(
            this.http.get(url, {
                headers: this.headers,
                body:    ''
            })
        );
    }

    public loginData():void
    {
        this.login = {};
        this.postLoginCall('/rest/login').subscribe((response:any) =>
        {
            this.login =
                {
                    accessToken: response.accessToken,
                    tokenType: response.tokenType
                };
            this.setHeader(response.accessToken);
        });
    }

    public postLoginCall(restRoute:string):Observable <Array<any>>
    {
        let url:string;
        url = 'https://i-ways.plentymarkets-cloud02.com' + restRoute;
        return this.mapRequest(
            this.http.post(url, {
                'password': '737eae3a',
                'username': 'py35319',
                'id': '38447'
            })
        );
    }

    public postCreateOrder(restRoute:string):Observable <Array<any>>
    {
        this.setAuthorization();
        let url:string;
        url = this._basePathUrl + restRoute;
        return this.mapRequest(
            this.http.post(url, {
                'typeId': 1,
                'plentyId': 38447
            }, {
                headers: this.headers
            })
        );
    }

    private setHeader(bearer:string):void
    {
        this.bearer = bearer;
        if(this.bearer !== null && this.bearer.length > 0) {
            this.headers.set('Authorization', 'Bearer ' + this.bearer);
            this.headers.set('Access-Control-Allow-Methods', 'GET, POST');
            this.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            this.headers.set('Access-Control-Allow-Origin', '*');
        }
    }
}
