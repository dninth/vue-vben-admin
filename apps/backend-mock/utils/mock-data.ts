export interface UserInfo {
  createTime?: string;
  email?: string;
  id: number;
  password: string;
  realName: string;
  remark?: string;
  roles: string[];
  status?: 0 | 1;
  username: string;
  homePath?: string;
}

export interface TimezoneOption {
  offset: number;
  timezone: string;
}

function nowText() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const MOCK_USERS: UserInfo[] = [
  {
    createTime: nowText(),
    email: 'vben@example.com',
    id: 0,
    password: '123456',
    realName: 'Vben',
    remark: '',
    roles: ['super'],
    status: 1,
    username: 'vben',
  },
  {
    createTime: nowText(),
    email: 'admin@example.com',
    id: 1,
    password: '123456',
    realName: 'Admin',
    remark: '',
    roles: ['admin'],
    status: 1,
    username: 'admin',
    homePath: '/workspace',
  },
  {
    createTime: nowText(),
    email: 'jack@example.com',
    id: 2,
    password: '123456',
    realName: 'Jack',
    remark: '',
    roles: ['user'],
    status: 1,
    username: 'jack',
    homePath: '/workspace',
  },
];

export const MOCK_CODES = [
  // super
  {
    codes: ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010'],
    username: 'vben',
  },
  {
    // admin
    codes: ['AC_100010', 'AC_100020', 'AC_100030'],
    username: 'admin',
  },
  {
    // user
    codes: ['AC_1000001', 'AC_1000002'],
    username: 'jack',
  },
];

const dashboardMenus = [
  {
    meta: {
      order: -1,
      title: 'page.dashboard.title',
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          title: 'page.dashboard.workspace',
        },
      },
    ],
    redirect: '/workspace',
  },
];

const createDemosMenus = (role: 'admin' | 'super' | 'user') => {
  const roleWithMenus = {
    admin: {
      component: '/demos/access/admin-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.adminVisible',
      },
      name: 'AccessAdminVisibleDemo',
      path: '/demos/access/admin-visible',
    },
    super: {
      component: '/demos/access/super-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.superVisible',
      },
      name: 'AccessSuperVisibleDemo',
      path: '/demos/access/super-visible',
    },
    user: {
      component: '/demos/access/user-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.userVisible',
      },
      name: 'AccessUserVisibleDemo',
      path: '/demos/access/user-visible',
    },
  };

  return [
    {
      meta: {
        icon: 'ic:baseline-view-in-ar',
        keepAlive: true,
        order: 1000,
        title: 'demos.title',
      },
      name: 'Demos',
      path: '/demos',
      redirect: '/demos/access',
      children: [
        {
          name: 'AccessDemos',
          path: '/demosaccess',
          meta: {
            icon: 'mdi:cloud-key-outline',
            title: 'demos.access.backendPermissions',
          },
          redirect: '/demos/access/page-control',
          children: [
            {
              name: 'AccessPageControlDemo',
              path: '/demos/access/page-control',
              component: '/demos/access/index',
              meta: {
                icon: 'mdi:page-previous-outline',
                title: 'demos.access.pageAccess',
              },
            },
            {
              name: 'AccessButtonControlDemo',
              path: '/demos/access/button-control',
              component: '/demos/access/button-control',
              meta: {
                icon: 'mdi:button-cursor',
                title: 'demos.access.buttonControl',
              },
            },
            {
              name: 'AccessMenuVisible403Demo',
              path: '/demos/access/menu-visible-403',
              component: '/demos/access/menu-visible-403',
              meta: {
                authority: ['no-body'],
                icon: 'mdi:button-cursor',
                menuVisibleWithForbidden: true,
                title: 'demos.access.menuVisible403',
              },
            },
            roleWithMenus[role],
          ],
        },
      ],
    },
  ];
};

export const MOCK_MENUS = [
  {
    menus: [...dashboardMenus, ...createDemosMenus('super')],
    username: 'vben',
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus('admin')],
    username: 'admin',
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus('user')],
    username: 'jack',
  },
];

export const MOCK_MENU_LIST = [
  {
    id: 1,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: 'page.dashboard.title',
    },
    name: 'Dashboard',
    path: '/dashboard',
    redirect: '/workspace',
    status: 1,
    type: 'catalog',
    children: [
      {
        id: 101,
        pid: 1,
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        type: 'menu',
        status: 1,
        meta: {
          icon: 'carbon:workspace',
          title: 'page.dashboard.workspace',
        },
      },
    ],
  },
  {
    id: 2,
    meta: {
      icon: 'carbon:settings',
      order: 9997,
      title: 'system.title',
      badge: 'new',
      badgeType: 'normal',
      badgeVariants: 'primary',
    },
    status: 1,
    type: 'catalog',
    name: 'System',
    path: '/system',
    children: [
      {
        id: 200,
        pid: 2,
        path: '/system/role',
        name: 'SystemRole',
        status: 1,
        type: 'menu',
        authCode: 'System:Role:List',
        meta: {
          icon: 'carbon:user-role',
          title: 'system.role.title',
        },
        component: '/system/role/list',
        children: [
          {
            id: 20_201,
            pid: 200,
            name: 'SystemRoleCreate',
            status: 1,
            type: 'button',
            authCode: 'System:Role:Create',
            meta: { title: 'common.create' },
          },
          {
            id: 20_202,
            pid: 200,
            name: 'SystemRoleEdit',
            status: 1,
            type: 'button',
            authCode: 'System:Role:Edit',
            meta: { title: 'common.edit' },
          },
          {
            id: 20_203,
            pid: 200,
            name: 'SystemRoleDelete',
            status: 1,
            type: 'button',
            authCode: 'System:Role:Delete',
            meta: { title: 'common.delete' },
          },
        ],
      },
      {
        id: 201,
        pid: 2,
        path: '/system/menu',
        name: 'SystemMenu',
        authCode: 'System:Menu:List',
        status: 1,
        type: 'menu',
        meta: {
          icon: 'carbon:menu',
          title: 'system.menu.title',
        },
        component: '/system/menu/list',
        children: [
          {
            id: 20_101,
            pid: 201,
            name: 'SystemMenuCreate',
            status: 1,
            type: 'button',
            authCode: 'System:Menu:Create',
            meta: { title: 'common.create' },
          },
          {
            id: 20_102,
            pid: 201,
            name: 'SystemMenuEdit',
            status: 1,
            type: 'button',
            authCode: 'System:Menu:Edit',
            meta: { title: 'common.edit' },
          },
          {
            id: 20_103,
            pid: 201,
            name: 'SystemMenuDelete',
            status: 1,
            type: 'button',
            authCode: 'System:Menu:Delete',
            meta: { title: 'common.delete' },
          },
        ],
      },
      {
        id: 203,
        pid: 2,
        path: '/system/user',
        name: 'SystemUser',
        status: 1,
        type: 'menu',
        authCode: 'System:User:List',
        meta: {
          icon: 'carbon:user',
          title: 'system.user.title',
        },
        component: '/system/user/list',
        children: [
          {
            id: 20_301,
            pid: 203,
            name: 'SystemUserCreate',
            status: 1,
            type: 'button',
            authCode: 'System:User:Create',
            meta: { title: 'common.create' },
          },
          {
            id: 20_302,
            pid: 203,
            name: 'SystemUserEdit',
            status: 1,
            type: 'button',
            authCode: 'System:User:Edit',
            meta: { title: 'common.edit' },
          },
          {
            id: 20_303,
            pid: 203,
            name: 'SystemUserDelete',
            status: 1,
            type: 'button',
            authCode: 'System:User:Delete',
            meta: { title: 'common.delete' },
          },
        ],
      },
    ],
  },
];

export function getMenuIds(menus: any[]) {
  const ids: number[] = [];
  menus.forEach((item) => {
    ids.push(item.id);
    if (item.children && item.children.length > 0) {
      ids.push(...getMenuIds(item.children));
    }
  });
  return ids;
}

export interface SystemRoleItem {
  createTime: string;
  id: number;
  name: string;
  permissions: number[];
  remark?: string;
  status: 0 | 1;
}

export const MOCK_ROLE_LIST: SystemRoleItem[] = [
  {
    createTime: nowText(),
    id: 1,
    name: '超级管理员',
    permissions: getMenuIds(MOCK_MENU_LIST),
    remark: '',
    status: 1,
  },
  {
    createTime: nowText(),
    id: 2,
    name: '管理员',
    permissions: [],
    remark: '',
    status: 1,
  },
  {
    createTime: nowText(),
    id: 3,
    name: '普通用户',
    permissions: [],
    remark: '',
    status: 1,
  },
  // 额外的模拟角色数据（用于表格滚动/分页等场景验证）
  ...Array.from({ length: 30 }, (_, idx): SystemRoleItem => {
    const id = 4 + idx;
    return {
      createTime: nowText(),
      id,
      name: `测试角色-${String(id).padStart(2, '0')}`,
      // 部分角色给全量权限，便于权限树展示/回显测试
      permissions: id % 7 === 0 ? getMenuIds(MOCK_MENU_LIST) : [],
      remark: id % 3 === 0 ? '示例角色' : '',
      status: id % 5 === 0 ? 0 : 1,
    };
  }),
];

/**
 * 时区选项
 */
export const TIME_ZONE_OPTIONS: TimezoneOption[] = [
  {
    offset: -5,
    timezone: 'America/New_York',
  },
  {
    offset: 0,
    timezone: 'Europe/London',
  },
  {
    offset: 8,
    timezone: 'Asia/Shanghai',
  },
  {
    offset: 9,
    timezone: 'Asia/Tokyo',
  },
  {
    offset: 9,
    timezone: 'Asia/Seoul',
  },
];
