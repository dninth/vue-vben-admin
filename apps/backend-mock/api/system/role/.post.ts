import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { createRole } from '~/utils/system-store';
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

  const body = await readBody<Record<string, any>>(event);
  if (!body?.name) {
    setResponseStatus(event, 400);
    return useResponseError('BadRequestException', 'name is required');
  }

  const created = createRole({
    ...body,
    permissions: Array.isArray(body.permissions)
      ? body.permissions
      : body.permissions
        ? [body.permissions]
        : [],
  } as any);

  return useResponseSuccess(created);
});
