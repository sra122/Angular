import {
    Component,
    OnInit
} from '@angular/core';
import { StatsDataService } from './stats-view.service';
import { TerraAlertComponent, TerraLeafInterface } from '@plentymarkets/terra-components';
import { isNullOrUndefined } from 'util';

interface PluginInterface
{
    name?:string;
    id?:number;
    created_at?:string;
}
interface UserInterface
{
    username?:string;
    email?:string;
}
interface WebStoreInterface
{
    id?:number;
    name?:string;
    type?:string;
}

interface OrderInterface
{
    id?:number;
    typeId?:number;
}

interface GetOrderInterface
{
    orderType?:string;
    contactId?:number;
}

interface CategoriesInterface
{
    id?:number;
    level?:number;
    name?:any;
    parentId?:number;
    children?:Array<CategoriesInterface>;
    details?:Array<CategoriesInterface>;
}

interface VendorCategoriesInterface
{
    id?:number;
    name?:string;
    children_ids?:Array<VendorCategoriesInterface>;
    children?:Array<VendorCategoriesInterface>;
    level?:number;
}

@Component({
    selector: 'stats-view',
    template: require('./stats-view.component.html'),
    styles:   [require('./stats-view.component.scss')]
})
export class StatsViewComponent implements OnInit
{
    public plugins:Array<PluginInterface>;
    public user:UserInterface;
    public categories:Array<CategoriesInterface>;
    public vendorCategories:Array<VendorCategoriesInterface>;
    public webStores:Array<WebStoreInterface>;
    public order:OrderInterface;
    public getorder:GetOrderInterface;

    private _alert:TerraAlertComponent;

    constructor(private _statsDataService:StatsDataService)
    {
        this._alert = TerraAlertComponent.getInstance();
    }

    public ngOnInit():void
    {
    }

    public updateData():void
    {
        this.createPluginData();
        this.createUserData();
        this.createWebStoreData();
        this.getCategories();
        this.getVendorCategories();
        this._alert.addAlert(
            {
                msg:'Fetching data',
                type:'info',
                dismissOnTimeout:3000,
                identifier: 'info'
            });
    }

    public getorderItem():void
    {
        this.getorder = {};
        this._statsDataService.getRestCallData('orders').subscribe((response:any) =>
        {
            console.log(response);
            this.getorder =
                {
                    orderType: response.orderType,
                    contactId: response.contactId
                };
        });
    }

    private createPluginData():void
    {
        this.plugins = [];
        this._statsDataService.getRestCallData('plugins').subscribe((response:Array<any>) =>
        {
            for(let plugin of response)
            {
                this.plugins.push(
                    {
                        name: plugin.name,
                        id: plugin.id,
                        created_at: plugin.created_at
                    });
            }
        });
    }

    private createWebStoreData():void
    {
        this.webStores = [];
        this._statsDataService.getRestCallData('webstores').subscribe((response:Array<any>) =>
        {
            for(let store of response)
            {
                this.webStores.push(
                    {
                        id: store.id,
                        name: store.name,
                        type: store.type
                    });
            }
        });
    }

    private createUserData():void
    {
        this.user = {};
        this._statsDataService.getRestCallData('user').subscribe((response:any) =>
        {
            this.user =
                {
                    username: response.user,
                    email: response.user_email
                };
        });
    }

    private getCategories():void
    {
        this.categories = [];
        this._statsDataService.getRestCallData('markets/panda-black/parent-categories').subscribe((response:any) =>
        {
            for(let category of response.categoryDetails)
            {
                this.categories.push(this.getChildCategories(category));
            }
        });
    }

    private getChildCategories(category:CategoriesInterface):TerraLeafInterface
    {
        let leafData:TerraLeafInterface = {
            caption: category.details[0].name,
            id: category.id,
            icon:null,
            subLeafList:null,
            isOpen: false
        };

        if(!isNullOrUndefined(category.children))
        {
            leafData.icon = 'icon-folder';
            leafData.subLeafList = [];
            category.children.forEach((child:any) =>
            {
                leafData.subLeafList.push(this.getChildCategories(child));
            });
        }

        return leafData;
    }

    private getVendorCategories():void
    {
        this.vendorCategories = [];
        this._statsDataService.getRestCallData('markets/panda-black/vendor-categories').subscribe((response:any) =>
        {
            for(let category of response)
            {
                this.vendorCategories.push(this.getVendorChildCategories(category));
            }
        });
    }

    private getVendorChildCategories(category:CategoriesInterface):TerraLeafInterface
    {
        let vendorLeafData:TerraLeafInterface = {
            caption: category.name,
            id: category.id,
            icon:null,
            subLeafList:null,
        };

        if(!isNullOrUndefined(category.children))
        {
            if(category.children.length > 0)
            {
                vendorLeafData.icon = 'icon-folder';
                vendorLeafData.isOpen = true;
            } else {
                vendorLeafData.isOpen = false;
            }
            vendorLeafData.subLeafList = [];
            category.children.forEach((child:any) =>
            {
                vendorLeafData.subLeafList.push(this.getVendorChildCategories(child));
            });
        }

        return vendorLeafData;
    }
}
