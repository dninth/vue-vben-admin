<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { useVbenForm } from '#/adapter/form';
import { getMenuList } from '#/api/system/menu';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<Recordable<any>[]>([]);
const loadingPermissions = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = drawerApi.getData<SystemRoleApi.SystemRole>();
    formApi.resetForm();

    formData.value = data || undefined;

    if (permissions.value.length === 0) {
      await loadPermissions();
    }

    // 等待表单字段挂载完成
    await nextTick();
    if (data) {
      formApi.setValues(data);
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  drawerApi.lock();
  try {
    const values = await formApi.getValues<SystemRoleApi.RoleUpsertPayload>();
    if (formData.value?.id) {
      await updateRole(formData.value.id, values);
    } else {
      await createRole(values);
    }
    emit('success');
    drawerApi.close();
  } catch {
    // Mock 环境下写操作会被禁止，错误提示由 requestClient 统一处理
  } finally {
    drawerApi.unlock();
  }
}

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    permissions.value = (await getMenuList()) as unknown as Recordable<any>[];
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.role.name')])
    : $t('ui.actionTitle.create', [$t('system.role.name')]),
);

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }
  return classes.join(' ');
}
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <div v-loading="loadingPermissions" class="w-full">
          <Tree
            :tree-data="permissions"
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            icon-field="meta.icon"
            label-field="meta.title"
            multiple
            v-bind="slotProps"
            value-field="id"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta?.icon" :icon="value.meta.icon" />
              {{ $t(value.meta?.title) }}
            </template>
          </Tree>
        </div>
      </template>
    </Form>
  </Drawer>
</template>
