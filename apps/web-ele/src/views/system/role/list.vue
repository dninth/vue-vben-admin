<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRoleList, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async (
          { page }: { page: { currentPage: number; pageSize: number } },
          formValues: Recordable<any>,
        ) => {
          return await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});

function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

/**
 * 状态开关即将改变
 * @returns 返回 false 则中止改变，返回其他值（undefined/true）则允许改变
 */
async function onStatusChange(newStatus: 0 | 1, row: SystemRoleApi.SystemRole) {
  const statusText: Recordable<string> = {
    0: $t('common.disabled'),
    1: $t('common.enabled'),
  };

  try {
    await ElMessageBox.confirm(
      `你要将${row.name}的状态切换为 【${statusText[newStatus]}】 吗？`,
      '切换状态',
      { type: 'warning' },
    );
    await updateRole(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRole) {
  formDrawerApi.setData(row).open();
}

async function onDelete(row: SystemRoleApi.SystemRole) {
  const loading = ElMessage({
    duration: 0,
    message: $t('ui.actionMessage.deleting', [row.name]),
    type: 'info',
  });
  try {
    await deleteRole(row.id);
    loading.close();
    ElMessage.success($t('ui.actionMessage.deleteSuccess', [row.name]));
    onRefresh();
  } catch {
    loading.close();
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height content-class="min-h-0 flex flex-col">
    <FormDrawer @success="onRefresh" />
    <Grid class="min-h-0 flex-1" :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
