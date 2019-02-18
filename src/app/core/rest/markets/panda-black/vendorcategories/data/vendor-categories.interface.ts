export interface VendorCategoriesInterface
{
    id:number;
    level:number;
    name:string;
    isLeaf:boolean;
    parentId:number;
    children?:Array<VendorCategoriesInterface>;
    path?:Array<VendorCategoriesInterface>;
}
