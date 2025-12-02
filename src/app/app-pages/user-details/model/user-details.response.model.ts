export interface UserDetailsResponse {
    userId: number;
    username: string;
    email: string;
    isActive: boolean | string;
    roles: {
        roleId: number;
        roleName: string;
        roleDescription: string;
        isActive: boolean | string;
        isSelected: boolean;
    }[];


}
