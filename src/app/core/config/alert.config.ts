import { Injectable } from '@angular/core';

@Injectable()
export class AlertConfig
{
    private _callStatusEvent:(message, type) => void;

    public get callStatusEvent():(message, type) => void
    {
        return this._callStatusEvent;
    }

    public set callStatusEvent(value)
    {
        this._callStatusEvent = value;
    }
}