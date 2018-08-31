import { Component } from '@angular/core';
import {
    Translation,
    TranslationService
} from 'angular-l10n';

@Component({
    selector: 'plugin-terra-basic-app',
    template: require('./plugin-terra-basic.component.html'),
    styles:   [require('./plugin-terra-basic.component.scss')],
})
export class PluginTerraBasicComponent extends Translation
{
    private action:any = this.getUrlVars()['action'];

    public constructor(public translation:TranslationService)
    {
        super(translation);
    }

    public reload():void
    {
        location.reload();
    }

    private getUrlVars():any
    {
        let vars:any = {};

        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(substring:string, ...args:any[]):string
        {
            vars[args[0]] = args[1];
            return;
        });

        return vars;
    }
}
