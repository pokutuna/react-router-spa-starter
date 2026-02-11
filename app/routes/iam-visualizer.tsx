import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Shield, Info } from "lucide-react";
import type { Route } from "./+types/iam-visualizer";
import { sampleIAMRoles } from "../data/sample-iam-roles";
import type { IAMRole, PermissionNode } from "../types/iam";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IAM Permission Visualizer" },
    {
      name: "description",
      content: "Compare and visualize Google Cloud IAM roles and permissions",
    },
  ];
}

export default function IAMVisualizer() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const toggleNode = (path: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const permissionTree = useMemo(() => {
    if (selectedRoles.length === 0) return null;

    const selectedRoleObjects = sampleIAMRoles.filter((role) =>
      selectedRoles.includes(role.name)
    );

    return buildPermissionTree(selectedRoleObjects);
  }, [selectedRoles]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            IAM Permission Visualizer
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Compare and visualize Google Cloud IAM roles and their permissions
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RoleSelector
            roles={sampleIAMRoles}
            selectedRoles={selectedRoles}
            onToggleRole={toggleRole}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedRoles.length === 0 ? (
            <EmptyState />
          ) : (
            <PermissionTree
              tree={permissionTree}
              selectedRoles={selectedRoles}
              collapsedNodes={collapsedNodes}
              onToggleNode={toggleNode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface RoleSelectorProps {
  roles: IAMRole[];
  selectedRoles: string[];
  onToggleRole: (roleName: string) => void;
}

function RoleSelector({
  roles,
  selectedRoles,
  onToggleRole,
}: RoleSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Select Roles</h2>
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {roles.map((role, index) => {
          const selectedIndex = selectedRoles.indexOf(role.name);
          const roleLabel = selectedIndex >= 0 ? String.fromCharCode(65 + selectedIndex) : null;

          return (
            <label
              key={role.name}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.name)}
                onChange={() => onToggleRole(role.name)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {roleLabel && (
                    <span
                      className="flex items-center justify-center w-6 h-6 rounded font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: getRoleColor(selectedIndex, 0.2),
                        color: getRoleColor(selectedIndex, 1),
                      }}
                    >
                      {roleLabel}
                    </span>
                  )}
                  <div className="font-medium text-gray-900 text-sm">
                    {role.title}
                  </div>
                </div>
                <div className="text-xs text-gray-500 break-words">
                  {role.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {role.includedPermissions.length} permissions
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Roles Selected
      </h3>
      <p className="text-gray-600">
        Select one or more roles from the left panel to compare their
        permissions
      </p>
    </div>
  );
}

interface PermissionTreeProps {
  tree: PermissionNode | null;
  selectedRoles: string[];
  collapsedNodes: Set<string>;
  onToggleNode: (path: string) => void;
}

function PermissionTree({
  tree,
  selectedRoles,
  collapsedNodes,
  onToggleNode,
}: PermissionTreeProps) {
  if (!tree) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Permission Comparison</h2>
      <div className="mb-4 flex gap-2 flex-wrap">
        {selectedRoles.map((roleName, index) => {
          const role = sampleIAMRoles.find((r) => r.name === roleName);
          const roleLabel = String.fromCharCode(65 + index);
          return (
            <div
              key={roleName}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: getRoleColor(index, 0.2) }}
            >
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs"
                style={{
                  backgroundColor: getRoleColor(index, 1),
                  color: "white",
                }}
              >
                {roleLabel}
              </span>
              <span className="font-medium">{role?.title}</span>
            </div>
          );
        })}
      </div>
      <div className="space-y-1">
        {Array.from(tree.children.values()).map((child) => (
          <TreeNode
            key={child.fullPath}
            node={child}
            selectedRoles={selectedRoles}
            collapsedNodes={collapsedNodes}
            onToggleNode={onToggleNode}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  node: PermissionNode;
  selectedRoles: string[];
  collapsedNodes: Set<string>;
  onToggleNode: (path: string) => void;
  depth: number;
}

function TreeNode({
  node,
  selectedRoles,
  collapsedNodes,
  onToggleNode,
  depth,
}: TreeNodeProps) {
  const isCollapsed = collapsedNodes.has(node.fullPath);
  const hasChildren = node.children.size > 0;

  const stats = useMemo(() => {
    return calculateStats(node, selectedRoles);
  }, [node, selectedRoles]);

  const hasAllRoles = stats.rolesWithPermission === selectedRoles.length;
  const hasSomeRoles =
    stats.rolesWithPermission > 0 &&
    stats.rolesWithPermission < selectedRoles.length;
  const hasNoRoles = stats.rolesWithPermission === 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded transition-colors ${
          node.isLeaf
            ? "px-3 py-2 hover:bg-gray-50 cursor-default"
            : "px-2 py-1 hover:bg-gray-50 cursor-pointer"
        }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => hasChildren && onToggleNode(node.fullPath)}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {hasChildren ? (
            isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )
          ) : (
            <div className="w-3 h-3 flex-shrink-0" />
          )}
          <span
            className={`truncate ${
              node.isLeaf
                ? hasNoRoles
                  ? "text-gray-400 line-through"
                  : "text-gray-900"
                : "text-xs text-gray-500 font-medium"
            }`}
          >
            {node.isLeaf ? node.fullPath : `${node.fullPath}.*`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasChildren && isCollapsed && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
              {stats.totalLeafPermissions} perms
              {stats.diffCount > 0 && ` · ${stats.diffCount} diff`}
            </span>
          )}

          <div className="flex gap-0.5">
            {selectedRoles.map((_, index) => {
              const role = sampleIAMRoles.find((r) => r.name === selectedRoles[index]);
              const roleHasPermission = hasRoleInSubtree(
                node,
                role?.name || ""
              );
              const roleLabel = String.fromCharCode(65 + index);

              if (!roleHasPermission) return null;

              return (
                <span
                  key={index}
                  className="flex items-center justify-center w-5 h-5 rounded font-bold text-xs"
                  style={{
                    backgroundColor: getRoleColor(index, 0.2),
                    color: getRoleColor(index, 1),
                  }}
                  title={`${role?.title}`}
                >
                  {roleLabel}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div>
          {Array.from(node.children.values()).map((child) => (
            <TreeNode
              key={child.fullPath}
              node={child}
              selectedRoles={selectedRoles}
              collapsedNodes={collapsedNodes}
              onToggleNode={onToggleNode}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildPermissionTree(roles: IAMRole[]): PermissionNode {
  const root: PermissionNode = {
    name: "root",
    fullPath: "",
    children: new Map(),
    isLeaf: false,
    roles: new Set(),
  };

  for (const role of roles) {
    for (const permission of role.includedPermissions) {
      const parts = permission.split(".");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const pathSoFar = parts.slice(0, i + 1).join(".");
        const isLastPart = i === parts.length - 1;

        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            fullPath: pathSoFar,
            children: new Map(),
            isLeaf: isLastPart,
            roles: new Set(),
          });
        }

        current = current.children.get(part)!;

        if (isLastPart) {
          current.roles.add(role.name);
        }
      }
    }
  }

  return root;
}

function calculateStats(
  node: PermissionNode,
  selectedRoles: string[]
): {
  totalLeafPermissions: number;
  rolesWithPermission: number;
  diffCount: number;
} {
  let totalLeafPermissions = 0;
  const rolePermissionCounts = new Map<string, number>();

  function traverse(n: PermissionNode) {
    if (n.isLeaf) {
      totalLeafPermissions++;
      for (const roleName of selectedRoles) {
        if (n.roles.has(roleName)) {
          rolePermissionCounts.set(
            roleName,
            (rolePermissionCounts.get(roleName) || 0) + 1
          );
        }
      }
    }

    for (const child of n.children.values()) {
      traverse(child);
    }
  }

  traverse(node);

  const uniqueCounts = new Set(rolePermissionCounts.values());
  const diffCount =
    uniqueCounts.size > 1 || (uniqueCounts.size === 1 && uniqueCounts.has(0))
      ? totalLeafPermissions
      : 0;

  const rolesWithPermission = Array.from(rolePermissionCounts.values()).filter(
    (count) => count > 0
  ).length;

  return { totalLeafPermissions, rolesWithPermission, diffCount };
}

function hasRoleInSubtree(node: PermissionNode, roleName: string): boolean {
  if (node.roles.has(roleName)) {
    return true;
  }

  for (const child of node.children.values()) {
    if (hasRoleInSubtree(child, roleName)) {
      return true;
    }
  }

  return false;
}

function getRoleColor(index: number, opacity: number): string {
  const colors = [
    [59, 130, 246], // blue
    [16, 185, 129], // green
    [249, 115, 22], // orange
    [168, 85, 247], // purple
    [236, 72, 153], // pink
    [234, 179, 8], // yellow
    [239, 68, 68], // red
  ];

  const color = colors[index % colors.length];
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
}
