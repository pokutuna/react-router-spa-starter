export interface IAMRole {
  name: string;
  title: string;
  description: string;
  includedPermissions: string[];
}

export interface PermissionNode {
  name: string;
  fullPath: string;
  children: Map<string, PermissionNode>;
  isLeaf: boolean;
  roles: Set<string>;
}
