import {
    APP_INITIALIZER,
    NgModule
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PluginTerraBasicComponent } from './plugin-terra-basic.component';
import { StartComponent } from './views/start/start.component';
import { TerraComponentsModule } from '@plentymarkets/terra-components/app/terra-components.module';
import { HttpModule } from '@angular/http';
import { TranslationModule } from 'angular-l10n';
import { FormsModule } from '@angular/forms';
import { LocalizationConfig } from './core/localization/terra-localization.config';
import { StatsViewComponent } from './views/stats-view/stats-view.component';
import { StatsDataService } from './views/stats-view/stats-view.service';

@NgModule({
    imports:      [
        BrowserModule,
        HttpModule,
        FormsModule,
        TranslationModule.forRoot(),
        TerraComponentsModule.forRoot()
    ],
    declarations: [
        PluginTerraBasicComponent,
        StartComponent,
        StatsViewComponent
    ],
    providers:    [
        LocalizationConfig,
        {
            provide:    APP_INITIALIZER,
            useFactory: initLocalization,
            deps:       [LocalizationConfig],
            multi:      true
        },
        StatsDataService
    ],
    bootstrap:    [
        PluginTerraBasicComponent
    ]
})
export class PluginTerraBasicModule
{
}

export function initLocalization(localizationConfig:LocalizationConfig):Function
{
    return () => localizationConfig.load();
}
