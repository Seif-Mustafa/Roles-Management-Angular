import { GenericIdName } from "@/common/models/generic-id-name.model";

export interface addDeal{
    title?: string;
    currency?:  GenericIdName;
    dealValue?:number;
    commitDate?:Date;
    closureDate?:Date;
    description?:string;
}