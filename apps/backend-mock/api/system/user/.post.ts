import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { createUser } from '~/utils/system-store';
import { unAuthorizedResponse, useResponseError, useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<Record<string, any>>(event);
  if (!body?.username || !body?.realName) {
    setResponseStatus(event, 400);
    return useResponseError('BadRequestException', 'username and realName are required');
  }

  const created = createUser({
    ...body,
    // ensure roles is always an array
    roles: Array.isArray(body.roles) ? body.roles : body.roles ? [body.roles] : [],
  } as any);

  // Avoid leaking password.
  const { password: _pwd, ...rest } = created as any;
  return useResponseSuccess(rest);
});

