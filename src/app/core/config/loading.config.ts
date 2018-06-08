import { Injectable } from '@angular/core';

@Injectable()
export class LoadingConfig
{
    private _callLoadingEvent:(boolean) => void;

    public get callLoadingEvent(): (value:boolean) => void
    {
        return this._callLoadingEvent;
    }

    public set callLoadingEvent(value)
    {
        this._callLoadingEvent = value;
    }
}