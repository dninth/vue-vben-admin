import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseStatus,
} from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { updateUser } from '~/utils/system-store';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const id = getRouterParam(event, 'id');
  if (!id) {
    setResponseStatus(event, 400);
    return useResponseError('BadRequestException', 'id is required');
  }

  const body = await readBody<Record<string, any>>(event);
  const updated = updateUser(id, {
    ...body,
    roles: Array.isArray(body?.roles)
      ? body.roles
      : body?.roles
        ? [body.roles]
        : undefined,
  } as any);

  if (!updated) {
    setResponseStatus(event, 404);
    return useResponseError('NotFoundException', `user ${id} not found`);
  }

  const { password: _pwd, ...rest } = updated as any;
  return useResponseSuccess(rest);
});
