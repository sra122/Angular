import {
    APP_INITIALIZER,
    NgModule
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PluginTerraBasicComponent } from './plugin-terra-basic.component';
import { StartComponent } from './views/start/start.component';
import { TerraComponentsModule } from '@plentymarkets/terra-components/app/terra-components.module';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { L10nLoader, TranslationModule } from 'angular-l10n';
import { FormsModule } from '@angular/forms';
import { l10nConfig } from './core/localization/terra-localization.config';
import { StatsViewComponent } from './views/stats-view/stats-view.component';
import { StatsDataService } from './views/stats-view/stats-view.service';
import { ItoolsComponent } from './views/itools/itools.component';
import { VendorCategoriesService } from './core/rest/markets/panda-black/vendorcategories/vendorcategories.service';
import { LoadingConfig } from './core/config/loading.config';


@NgModule({
    imports:      [
        BrowserModule,
        HttpModule,
        FormsModule,
        HttpClientModule,
        TranslationModule.forRoot(l10nConfig),
        TerraComponentsModule.forRoot()
    ],
    declarations: [
        PluginTerraBasicComponent,
        StartComponent,
        StatsViewComponent,
        ItoolsComponent
    ],
    providers:    [
        LoadingConfig,
        {
            provide:    APP_INITIALIZER,
            useFactory: initLocalization,
            deps:       [l10nConfig],
            multi:      true
        },
        StatsDataService,
        VendorCategoriesService
    ],
    bootstrap:    [
        PluginTerraBasicComponent
    ]
})

export class PluginTerraBasicModule
{
    constructor(public l10nLoader:L10nLoader) {
        this.l10nLoader.load();
    }
}

function initLocalization(l10nLoader:L10nLoader):Function
{
    return ():Promise<void> => l10nLoader.load();
}

