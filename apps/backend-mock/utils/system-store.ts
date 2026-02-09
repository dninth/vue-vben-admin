import type { UserInfo } from './mock-data';

import { MOCK_MENU_LIST, MOCK_ROLE_LIST, MOCK_USERS } from './mock-data';

type IdLike = number | string;

type SystemRoleItem = (typeof MOCK_ROLE_LIST)[number];
type SystemMenuItem = (typeof MOCK_MENU_LIST)[number];

function nowText() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toIdString(id: IdLike) {
  return String(id);
}

function deepClone<T>(val: T): T {
  return structuredClone(val);
}

function maxNumericId(ids: IdLike[]) {
  let max = 0;
  for (const id of ids) {
    const n = Number(id);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return max;
}

function walkMenus(
  menus: SystemMenuItem[],
  visitor: (node: SystemMenuItem) => void,
) {
  for (const menu of menus) {
    visitor(menu);
    if (menu.children && menu.children.length > 0) {
      walkMenus(menu.children as SystemMenuItem[], visitor);
    }
  }
}

function findMenuWithParent(
  menus: SystemMenuItem[],
  id: IdLike,
): {
  index: number;
  node: SystemMenuItem;
  parent: null | SystemMenuItem;
} | null {
  const idStr = toIdString(id);

  let found: {
    index: number;
    node: SystemMenuItem;
    parent: null | SystemMenuItem;
  } | null = null;

  const dfs = (list: SystemMenuItem[], parent: null | SystemMenuItem) => {
    for (let i = 0; i < list.length; i++) {
      const node = list[i]!;
      if (toIdString(node.id) === idStr) {
        found = { index: i, node, parent };
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (dfs(node.children as SystemMenuItem[], node)) return true;
      }
    }
    return false;
  };

  dfs(menus, null);
  return found;
}

let users: UserInfo[] = deepClone(MOCK_USERS);
let roles: SystemRoleItem[] = deepClone(MOCK_ROLE_LIST);
let menus: SystemMenuItem[] = deepClone(MOCK_MENU_LIST);

export function getUsers() {
  return users;
}

export function createUser(
  payload: Omit<UserInfo, 'id' | 'password'> & Partial<Pick<UserInfo, 'id'>>,
) {
  const id = payload.id ?? maxNumericId(users.map((u) => u.id)) + 1;
  const user: UserInfo = {
    createTime: payload.createTime ?? nowText(),
    email: payload.email ?? '',
    homePath: payload.homePath,
    id: Number(id),
    password: '123456',
    realName: payload.realName,
    remark: payload.remark ?? '',
    roles: payload.roles ?? [],
    status: payload.status ?? 1,
    username: payload.username,
  };
  users.push(user);
  return user;
}

export function updateUser(id: IdLike, payload: Partial<UserInfo>) {
  const idx = users.findIndex((u) => toIdString(u.id) === toIdString(id));
  if (idx < 0) return null;

  const prev = users[idx]!;
  // password 不允许通过系统管理接口修改（避免影响登录演示）
  const { password: _password, id: _id, ...rest } = payload;
  users[idx] = { ...prev, ...rest, id: prev.id, password: prev.password };
  return users[idx]!;
}

export function deleteUser(id: IdLike) {
  const idx = users.findIndex((u) => toIdString(u.id) === toIdString(id));
  if (idx < 0) return false;
  users.splice(idx, 1);
  return true;
}

export function getRoles() {
  return roles;
}

export function createRole(
  payload: Partial<SystemRoleItem> & Pick<SystemRoleItem, 'name'>,
) {
  const id = maxNumericId(roles.map((r) => r.id)) + 1;
  const role: SystemRoleItem = {
    createTime: payload.createTime ?? nowText(),
    id,
    name: payload.name,
    permissions: payload.permissions ?? [],
    remark: payload.remark ?? '',
    status: payload.status ?? 1,
  };
  roles.push(role);
  return role;
}

export function updateRole(id: IdLike, payload: Partial<SystemRoleItem>) {
  const idx = roles.findIndex((r) => toIdString(r.id) === toIdString(id));
  if (idx < 0) return null;
  const prev = roles[idx]!;
  roles[idx] = { ...prev, ...payload, id: prev.id };
  return roles[idx]!;
}

export function deleteRole(id: IdLike) {
  const idx = roles.findIndex((r) => toIdString(r.id) === toIdString(id));
  if (idx < 0) return false;
  roles.splice(idx, 1);
  return true;
}

export function getMenus() {
  return menus;
}

export function createMenu(
  payload: Partial<SystemMenuItem> & Pick<SystemMenuItem, 'name' | 'type'>,
) {
  const ids: IdLike[] = [];
  walkMenus(menus, (m) => ids.push(m.id));
  const id = maxNumericId(ids) + 1;

  const node: SystemMenuItem = {
    ...payload,
    id,
    name: payload.name,
    type: payload.type,
    status: payload.status ?? 1,
  } as SystemMenuItem;

  const pid = (payload as any).pid;
  if (pid === undefined || pid === null || pid === 0 || pid === '0') {
    delete (node as any).pid;
    menus.push(node);
    return node;
  }

  const parentHit = findMenuWithParent(menus, pid);
  if (!parentHit) {
    // fallback: 作为根节点插入
    menus.push(node);
    return node;
  }

  node.pid = parentHit.node.id as any;
  parentHit.node.children = (parentHit.node.children || []) as any;
  (parentHit.node.children as any).push(node);
  return node;
}

export function updateMenu(id: IdLike, payload: Partial<SystemMenuItem>) {
  const hit = findMenuWithParent(menus, id);
  if (!hit) return null;

  // 更新 pid 需要移动节点
  const nextPid = (payload as any).pid;
  const shouldMove =
    nextPid !== undefined &&
    nextPid !== null &&
    toIdString(nextPid) !== toIdString((hit.node as any).pid ?? 0);

  const updated: SystemMenuItem = { ...hit.node, ...payload, id: hit.node.id };

  if (!shouldMove) {
    if (hit.parent) {
      (hit.parent.children as any)[hit.index] = updated;
    } else {
      menus[hit.index] = updated;
    }
    return updated;
  }

  // 从旧位置移除
  if (hit.parent) {
    (hit.parent.children as any).splice(hit.index, 1);
  } else {
    menus.splice(hit.index, 1);
  }

  // 插入到新父级
  if (nextPid === 0 || nextPid === '0') {
    delete (updated as any).pid;
    menus.push(updated);
    return updated;
  }

  const parentHit = findMenuWithParent(menus, nextPid);
  if (!parentHit) {
    menus.push(updated);
    return updated;
  }

  updated.pid = parentHit.node.id as any;
  parentHit.node.children = (parentHit.node.children || []) as any;
  (parentHit.node.children as any).push(updated);
  return updated;
}

export function deleteMenu(id: IdLike) {
  const hit = findMenuWithParent(menus, id);
  if (!hit) return false;
  if (hit.parent) {
    (hit.parent.children as any).splice(hit.index, 1);
  } else {
    menus.splice(hit.index, 1);
  }
  return true;
}

export function resetSystemStore() {
  users = deepClone(MOCK_USERS);
  roles = deepClone(MOCK_ROLE_LIST);
  menus = deepClone(MOCK_MENU_LIST);
}
