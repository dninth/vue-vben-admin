import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { getMenus } from '~/utils/system-store';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const roles = userinfo.roles ?? [];
  const canAccessSystem = roles.includes('admin') || roles.includes('super');

  // Backend accessMode uses this menu list to generate dynamic routes.
  // Keep `Profile` route available (but hidden in menu) for the user dropdown.
  const menus = structuredClone(getMenus()).filter((item) => {
    if (item.path === '/system') {
      return canAccessSystem;
    }
    return true;
  });

  menus.push({
    name: 'Profile',
    path: '/profile',
    component: '/_core/profile/index',
    type: 'menu',
    status: 1,
    meta: {
      hideInMenu: true,
      title: 'page.auth.profile',
    },
  } as any);

  return useResponseSuccess(menus as any);
});
