import { VendorCategoriesInterface } from './vendor-categories.interface';
import { CategoryInterface } from '../../categories/data/categories.interface';

export interface VendorCategoriesCorrelationInterface
{
    uiId?:number;
    vendorCategory:VendorCategoriesInterface;
    category:CategoryInterface;
}