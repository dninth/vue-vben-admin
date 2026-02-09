import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemMenuApi {
  /** 徽标颜色集合 */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;
  /** 徽标类型集合 */
  export const BadgeTypes = ['dot', 'normal', 'none'] as const;
  /** 菜单类型集合 */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;

  /** 系统菜单 */
  export interface SystemMenu {
    [key: string]: any;
    /** 后端权限标识 */
    authCode?: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 组件 */
    component?: string;
    /** 菜单ID */
    id: number | string;
    /** 菜单元数据 */
    meta?: {
      activeIcon?: string;
      activePath?: string;
      affixTab?: boolean;
      affixTabOrder?: number;
      badge?: string;
      badgeType?: (typeof BadgeTypes)[number];
      badgeVariants?: (typeof BadgeVariants)[number];
      hideChildrenInMenu?: boolean;
      hideInBreadcrumb?: boolean;
      hideInMenu?: boolean;
      hideInTab?: boolean;
      icon?: string;
      iframeSrc?: string;
      keepAlive?: boolean;
      link?: string;
      maxNumOfOpenTab?: number;
      noBasicLayout?: boolean;
      openInNewWindow?: boolean;
      order?: number;
      query?: Recordable<any>;
      title?: string;
    };
    /** 菜单名称 */
    name: string;
    /** 路由路径 */
    path: string;
    /** 父级ID */
    pid?: number | string;
    /** 重定向 */
    redirect?: string;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number];
    /** 状态 */
    status?: 0 | 1;
  }

  export type MenuUpsertPayload = Partial<
    Pick<
      SystemMenu,
      'authCode' | 'component' | 'meta' | 'path' | 'pid' | 'redirect' | 'status'
    >
  > &
    Pick<SystemMenu, 'name' | 'type'>;
}

function walkMenus(
  menus: SystemMenuApi.SystemMenu[],
  visitor: (menu: SystemMenuApi.SystemMenu) => void,
) {
  for (const menu of menus) {
    visitor(menu);
    if (menu.children && menu.children.length > 0) {
      walkMenus(menu.children, visitor);
    }
  }
}

/**
 * 获取菜单数据列表（Mock）
 */
export async function getMenuList() {
  return requestClient.get<SystemMenuApi.SystemMenu[]>('/system/menu/list');
}

/**
 * 前端唯一性校验：菜单名称是否已存在
 */
export async function isMenuNameExists(name: string, id?: number | string) {
  const menus = await getMenuList();
  let exists = false;
  walkMenus(menus, (menu) => {
    if (exists) return;
    if (id !== undefined && String(menu.id) === String(id)) return;
    if (String(menu.name).trim() === String(name).trim()) {
      exists = true;
    }
  });
  return exists;
}

/**
 * 前端唯一性校验：路由地址是否已存在
 */
export async function isMenuPathExists(path: string, id?: number | string) {
  const menus = await getMenuList();
  let exists = false;
  walkMenus(menus, (menu) => {
    if (exists) return;
    if (id !== undefined && String(menu.id) === String(id)) return;
    if (String(menu.path).trim() === String(path).trim()) {
      exists = true;
    }
  });
  return exists;
}

/**
 * 以下写操作在演示 Mock 环境会被后端拦截（403），仅保留接口形态
 */
export async function createMenu(data: SystemMenuApi.MenuUpsertPayload) {
  return requestClient.post('/system/menu', data);
}

export async function updateMenu(
  id: number | string,
  data: SystemMenuApi.MenuUpsertPayload,
) {
  return requestClient.put(`/system/menu/${id}`, data);
}

export async function deleteMenu(id: number | string) {
  return requestClient.delete(`/system/menu/${id}`);
}
