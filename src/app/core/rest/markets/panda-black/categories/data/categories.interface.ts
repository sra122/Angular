export interface CategoryInterface
{
    id:number;
    level:number;
    name:string;
    isLeaf:boolean;
    parentId:number;
    children?:Array<CategoryInterface>;
    path?:Array<CategoryInterface>;
}