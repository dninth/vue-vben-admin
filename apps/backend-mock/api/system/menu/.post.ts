import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { createMenu } from '~/utils/system-store';
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
  if (!body?.name || !body?.type) {
    setResponseStatus(event, 400);
    return useResponseError(
      'BadRequestException',
      'name and type are required',
    );
  }

  const created = createMenu(body as any);
  return useResponseSuccess(created);
});
