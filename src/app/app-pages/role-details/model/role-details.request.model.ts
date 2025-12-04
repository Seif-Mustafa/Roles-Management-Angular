export interface RoleDetailsRequest {
    roleId: number;
    roleName: string;
    roleDescription: string;
    isActive: boolean | string;
    pages: {
        pageId: number;
        isSelected: boolean;
    }[];
    buttons: {
        buttonId: number;
        isSelected: boolean;
    }[];
    // users: {
    //     userId: number;
    //     isSelected: boolean;
    // }[];
}
