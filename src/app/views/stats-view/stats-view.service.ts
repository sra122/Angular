import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import {
    TerraBaseService,
    TerraLoadingSpinnerService
} from '@plentymarkets/terra-components';

import { StatsViewComponent } from './stats-view.component';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class StatsDataService extends TerraBaseService
{
    public bearer:string;
    private _basePathUrl:string;
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
            // tslint:disable-next-line:max-line-length
            this.bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijk4NThkNWE4MTA0NTAwMmNkNjU4ZmVhMDg0OWM2MDIyNzZmYTliMjY0Y2IzYTdkZWRhMGZjOWRjODM3MGJmMDMzZmVjNjY4ZWRiMjEyODQ3In0.eyJhdWQiOiIxIiwianRpIjoiOTg1OGQ1YTgxMDQ1MDAyY2Q2NThmZWEwODQ5YzYwMjI3NmZhOWIyNjRjYjNhN2RlZGEwZmM5ZGM4MzcwYmYwMzNmZWM2NjhlZGIyMTI4NDciLCJpYXQiOjE1MjQ2NTI4MzYsIm5iZiI6MTUyNDY1MjgzNiwiZXhwIjoxNTI0NzM5MjM2LCJzdWIiOiIxIiwic2NvcGVzIjpbIioiXX0.Pl2N7XbADS4dF7-03GwvM94M7_2LqRm_0Hxo3OEpIqh7mkaSoObAGUAxNj9LNw95eas0ZSwuIS9WGU0GrmdMC_vSeuQoGR1xdP5vrn4DT-5uZ0fxaqfTSnP0mG7WWocBvwNHr28Qz0iPNa6QCUWSXlK_11iuVGFlXLZCW75LJ0tmfaWf4BnG9RzUrec7LNNIpOLX-TqRCR06pcrpziF59HC-1M5QhtqEDhmSBKsnM5LhRUEgdAFrO2Ak4nfI4WBVkwjl4PktxWPLHqcatG7-pzbLJ6xQxWbx34JE30-WT6RiGJF-HR1rPiiS87mFmIdsjavc3aqBEUm7Rij_7-fFN4i45jDnXL3777lxn54gbQy1jb2OURmGTGrlKdjqHr_ArVo6O5x0cueIoDqjcz__0e15u-oyI1xZ0gMIlItIPdLGRLIiS8mukprVaucMwmcn9G9Kd2bgVQlNAr4YG6bj4Awcjkqx-u1-3J222mBZ0YQySlZa6OmWhD-uGdXQl0dsJYQGmXAXyMtwgYCSu8WmJcJfY-QxpAT0IyOCIEYoi4Yt6KSmYz3SC0Jzn_AEGs0wyIzTyXIFby6O7RU42gn4xDbv2I60BHzrB852fJyldeUQODvalPHj7CTo8BNqQaTOzhDmnFQeCvDUhRxr9704lMT8kErHvS11Qopxf2XOLbg';
            this._basePathUrl = 'https://7c0dd4a2c3680b0a98155f62c4f8c2a434ab36a3.plentymarkets-cloud-ie.com';
            this.url = this._basePathUrl + this.url;
        }
        this.setHeader();
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

    public postRestCallData(restRoute:string):Observable <Array<any>>
    {
        let url:string;
        url = this._basePathUrl + restRoute;
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

    private setHeader():void
    {
        if(this.bearer !== null && this.bearer.length > 0)
        {
            this.headers.set('Authorization', 'Bearer ' + this.bearer);
            this.headers.set('Access-Control-Allow-Methods', 'GET, POST');
            this.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            this.headers.set('Access-Control-Allow-Origin', '*');
        }
    }
}
