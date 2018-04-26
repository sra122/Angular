import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import {
    TerraBaseService,
    TerraLoadingSpinnerService
} from '@plentymarkets/terra-components';


@Injectable()
export class StatsDataService extends TerraBaseService
{
    public bearer:string;
    private _basePathUrl:string;
    constructor(private _loadingSpinnerService:TerraLoadingSpinnerService,
                private _http:Http)
    {
        super(_loadingSpinnerService, _http, '/rest/');
        if(process.env.ENV !== 'production')
        {
            // tslint:disable-next-line:max-line-length
            this.bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjAxNzQ0MmZhNDAzMzRkMzY1YjFhNjcyZTY3NmI5O' +
                        'TRjZjg2NTQ0YTFjOGZkNjZiN2Q5Y2EwMGNmODA1ODU4YTg4N2Q5NTk5MTM3ZDUxZWNhIn0.eyJhdWQiOiIxIiwi' +
                        'anRpIjoiMDE3NDQyZmE0MDMzNGQzNjViMWE2NzJlNjc2Yjk5NGNmODY1NDRhMWM4ZmQ2NmI3ZDljYTAwY2Y4MDU' +
                        '4NThhODg3ZDk1OTkxMzdkNTFlY2EiLCJpYXQiOjE1MjQ3MjczMjMsIm5iZiI6MTUyNDcyNzMyMywiZXhwIjoxNT' +
                        'I0ODEzNzIzLCJzdWIiOiIxIiwic2NvcGVzIjpbIioiXX0.DC-i74vLaz1AXP9LX8IlG-6xESEy2Fkf2v_paTtkg' +
                        'x7ArYpClQz9tC-LBFwmbWa46y3epprwWvFxsLFx84QgdexCVMvxlwoh8Ls-qEceKTTIj473PWiX7TMJrMWgOtRq' +
                        '5g2SAnWLrc0-p4Wek3IPVNA3z3-3UfLpXdN2nsj1EM_gBFOhynhgEl-duDiDG2Cst1iZt9NIGBUaTrzBOU6u50-' +
                        '6bPFJ-LKP9xWPRSQPagNGhfOqOkK9avSGyAGxK_MY4NdLE0RJtPB9bkLqGXUqKM_rBBYh1hra2fiufwzZMK7cPF' +
                        'LPAgfcSZCzC7_DOuk9O12-F4M55vnUTLzOV10spsXB6pvKupAXGCN_5BFbSjJXxv538439XBRNiQsVB-2K9tgzOL' +
                        'DiFTp5dEAXmaX3wsYnCFnp6vGm7GVrmHPaROT9UuFdKS2UYK3nYBjWQT8WewTkfRiG4JWEvzw1qvbXm8ZnAW-aVe' +
                        'qcOkuJ4LpD7nqBX6tNUi4xQIJ_Pu17p7MT_4q6mjGKECu2oYe5PhNLrMIsgUL085TqHpyHBmgWeTfbXQGD1jEdDZJ' +
                        'Nt9GUANVHqmJ1deb69UUdlXlhY_nnutcszuWlCEozqWUD-qPTeiGEOLmtKhBzqgeb-PNZn4xO4oubK-7s1T9QMPhdLKQBzzPpankj85CWqfawKkVsN8I';
            this._basePathUrl = 'https://i-ways.plentymarkets-cloud02.com';
            this.url = this._basePathUrl + this.url;
        }
        this.setHeader();
    }

    public getRestCallData(restRoute:string):Observable <Array<any>>
    {
        this.setAuthorization();
        let url:string;
        url = this._basePathUrl + restRoute;
        let getreq = this.http.get(url, {
            headers: this.headers,
            body:    ''
        });

        console.log(this.headers);
        return this.mapRequest(
            this.http.get(url, {
                headers: this.headers,
                body:    ''
            })
        );
    }

    private setHeader():void
    {
        if(this.bearer !== null && this.bearer.length > 0)
        {
            this.headers.set('Authorization', 'Bearer ' + this.bearer);
            this.headers.set('Access-Control-Allow-Methods', 'GET');
            this.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            this.headers.set('Access-Control-Allow-Origin', '*');
        }
    }
}