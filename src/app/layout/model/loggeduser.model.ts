export interface LoggedUser {
    userId: number;
    username: string;
    email: string;
    token: string;
    userRoleTypeId: number;
    pages: Array<{
        pageId: number;
        pageName: string;
        resourceCode: string;
        parentPageId: number;
        isActive: string;
    }>;
    buttons: Array<{
        buttonId: number;
        buttonName: string;
        pageId: number;
        isActive: string;
    }>;
}
