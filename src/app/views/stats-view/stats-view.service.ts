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
            this.bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE2Njc3NzkzMzcxYmMzNGUwNmJjMWI2NDkyNWM4ZWU2OTZmMDMxYmUxYWEwNDg2ODE4YjMwOTEyOWUwNjU3ZDExMTExNWQ2MjQyNmQxODdkIn0.eyJhdWQiOiIxIiwianRpIjoiMTY2Nzc3OTMzNzFiYzM0ZTA2YmMxYjY0OTI1YzhlZTY5NmYwMzFiZTFhYTA0ODY4MThiMzA5MTI5ZTA2NTdkMTExMTE1ZDYyNDI2ZDE4N2QiLCJpYXQiOjE1MjQyMDg5MTQsIm5iZiI6MTUyNDIwODkxNCwiZXhwIjoxNTI0Mjk1MzE0LCJzdWIiOiIxIiwic2NvcGVzIjpbIioiXX0.oDFXndusZdjh_eymxZUYFndttYssAABbAKVf6Tb2ctRT54_FwhkqRcytjig9iWf7Mz5VpIvVdn6xq48bbMPF9a1Gagr4TN2d99sDxrY1B4b-3g51RnoGMICd4vzY5fUjaXbKn8cQiYSNeIr7-05EIZDCaVgmMuBeM24XFwc8vOIlY4IeKat5Kz1u164E1HULmvkEPYOXObj0XXNTiGsjflpa5jlaqv-Q8NsNN19rZTOAdQhOM47KbaVxC0FTI3N-zMocPOHgSnKiuKd1SqBESbNGrc_ge3l69reW18GriuEnoNtzxiaPvxQIXW5IleLit6hmnYPNQOlyQUFxqkvWfct1foJZxBkYCiDZFBu1Av43_Y8LEV2BvlV2no4XNNLIpO9dPd1BjEj_1qhWdxnowKw6tczMfovmvH7yjILqfQJ3F7Vmf6f5Beq9Dxs4OAjP1IVTi-EoepsYzaP6fnH3FIPE-XePVkkPjmM3F8ands1AETUfX41R3ObqeEZdljK-xVBiumW1o5mQ0NLvHtRkGNfdSLxGRYk_JC6DD-MGNpmf_96a-Wfh7hafnhYIu_JXYYu3sUE01QVYxj4OSPBeDkJKQJKNAywpgin4b1Dbh3s9Z59nu3G525yqnLCxqC3RM4Y51AXurBsc1C4cSHuoGnC3Dt7cYvfuHs8zdnFxZSI';
            this._basePathUrl = 'https://3383e1f8357cdd83e128877ba39770a8e5cc08d5.plentymarkets-cloud-de.com';
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