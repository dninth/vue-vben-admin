import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    createTime?: string;
    id: number | string;
    name: string;
    permissions: Array<number | string>;
    remark?: string;
    status: 0 | 1;
  }

  export type RoleUpsertPayload = Pick<SystemRole, 'name'> &
    Partial<Pick<SystemRole, 'createTime' | 'permissions' | 'remark' | 'status'>>;
}

/**
 * 获取角色列表数据（Mock）
 */
export async function getRoleList(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemRoleApi.SystemRole[];
    total: number;
  }>('/system/role/list', { params });
}

/**
 * 以下写操作在演示 Mock 环境会被后端拦截（403），仅保留接口形态
 */
export async function createRole(data: SystemRoleApi.RoleUpsertPayload) {
  return requestClient.post('/system/role', data);
}

export async function updateRole(
  id: number | string,
  data: Partial<SystemRoleApi.RoleUpsertPayload>,
) {
  return requestClient.put(`/system/role/${id}`, data);
}

export async function deleteRole(id: number | string) {
  return requestClient.delete(`/system/role/${id}`);
}

