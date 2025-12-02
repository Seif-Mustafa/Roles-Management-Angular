export interface UserDetailsRequest {
    userId: number;
    username: string;
    email: string;
    isActive: boolean | string;
    modifiedBy: number;
    roles: {
        roleId: number;
        isSelected: boolean;
    }[];


}
