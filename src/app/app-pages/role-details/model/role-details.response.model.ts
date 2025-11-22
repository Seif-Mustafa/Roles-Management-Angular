export interface RoleDetailsResponse {
    roleId: number;
    roleName: string;
    roleDescription: string;
    isActive: boolean | string;
    pages: {
        pageId: number;
        pageName: string;
        isActive: boolean | string;
        isSelected: boolean;
    }[];
    buttons: {
        buttonId: number;
        buttonName: string;
        isActive: boolean | string;
        isSelected: boolean;
    }[];
    users: {
        userId: number;
        username: string;
        isActive: boolean | string;
        isSelected: boolean;
    }[];
}
