import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { getUsers } from '~/utils/system-store';
import {
  unAuthorizedResponse,
  usePageResponseSuccess,
  useResponseSuccess,
} from '~/utils/response';

function pickFirst(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const query = getQuery(event);

  const page = pickFirst(query.page);
  const pageSize = pickFirst(query.pageSize);

  const id = pickFirst(query.id);
  const username = pickFirst(query.username);
  const realName = pickFirst(query.realName);
  const email = pickFirst(query.email);
  const remark = pickFirst(query.remark);
  const status = pickFirst(query.status);
  const startTime = pickFirst(query.startTime);
  const endTime = pickFirst(query.endTime);

  // Avoid leaking passwords.
  let list = structuredClone(getUsers()).map((item) => {
    const { password: _pwd, ...rest } = item;
    return rest;
  });

  if (id) {
    const q = String(id).toLowerCase();
    list = list.filter((item) => String(item.id).toLowerCase().includes(q));
  }
  if (username) {
    const q = String(username).toLowerCase();
    list = list.filter((item) =>
      String(item.username).toLowerCase().includes(q),
    );
  }
  if (realName) {
    const q = String(realName).toLowerCase();
    list = list.filter((item) =>
      String(item.realName).toLowerCase().includes(q),
    );
  }
  if (email) {
    const q = String(email).toLowerCase();
    list = list.filter((item) =>
      String(item.email ?? '')
        .toLowerCase()
        .includes(q),
    );
  }
  if (remark) {
    const q = String(remark).toLowerCase();
    list = list.filter((item) =>
      String(item.remark ?? '')
        .toLowerCase()
        .includes(q),
    );
  }
  if (startTime) {
    const q = String(startTime);
    list = list.filter((item) => String(item.createTime ?? '') >= q);
  }
  if (endTime) {
    const q = String(endTime);
    list = list.filter((item) => String(item.createTime ?? '') <= q);
  }
  if (['0', '1', 0, 1].includes(status as any)) {
    list = list.filter((item) => item.status === Number(status));
  }

  if (!page || !pageSize) {
    return useResponseSuccess({
      items: list,
      total: list.length,
    });
  }

  return usePageResponseSuccess(String(page), String(pageSize), list);
});
