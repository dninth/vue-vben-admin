import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    createTime?: string;
    email?: string;
    homePath?: string;
    id: number | string;
    realName: string;
    remark?: string;
    roles: string[];
    status?: 0 | 1;
    username: string;
  }

  export type UserUpsertPayload = Partial<
    Pick<SystemUser, 'createTime' | 'homePath' | 'remark' | 'status'>
  > &
    Pick<SystemUser, 'email' | 'realName' | 'roles' | 'username'>;
}

/**
 * 获取用户列表数据（Mock）
 */
export async function getUserList(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemUserApi.SystemUser[];
    total: number;
  }>('/system/user/list', { params });
}

/**
 * 以下写操作在演示 Mock 环境会被后端拦截（403），仅保留接口形态
 */
export async function createUser(data: SystemUserApi.UserUpsertPayload) {
  return requestClient.post('/system/user', data);
}

export async function updateUser(
  id: number | string,
  data: Partial<SystemUserApi.UserUpsertPayload>,
) {
  return requestClient.put(`/system/user/${id}`, data);
}

export async function deleteUser(id: number | string) {
  return requestClient.delete(`/system/user/${id}`);
}
