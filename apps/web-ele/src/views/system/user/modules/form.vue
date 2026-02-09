<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = drawerApi.getData<SystemUserApi.SystemUser>();
    formApi.resetForm();
    formData.value = data || undefined;

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
    const values = await formApi.getValues<SystemUserApi.UserUpsertPayload>();
    const id = formData.value?.id;
    await (id === undefined ? createUser(values) : updateUser(id, values));
    emit('success');
    drawerApi.close();
  } catch {
    // Mock 环境下写操作会被禁止，错误提示由 requestClient 统一处理
  } finally {
    drawerApi.unlock();
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id === undefined
    ? $t('ui.actionTitle.create', [$t('system.user.name')])
    : $t('ui.actionTitle.edit', [$t('system.user.name')]),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form class="mx-4" />
  </Drawer>
</template>
