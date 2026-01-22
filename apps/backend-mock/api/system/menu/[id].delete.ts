import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3';

import { verifyAccessToken } from '~/utils/jwt-utils';
import { deleteMenu } from '~/utils/system-store';
import { unAuthorizedResponse, useResponseError, useResponseSuccess } from '~/utils/response';

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

  const ok = deleteMenu(id);
  if (!ok) {
    setResponseStatus(event, 404);
    return useResponseError('NotFoundException', `menu ${id} not found`);
  }

  return useResponseSuccess(null);
});

