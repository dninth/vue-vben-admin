import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentType } from './component';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t, $te } from '@vben/locales';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { get, isFunction, isString } from '@vben/utils';

import { ElButton, ElImage, ElMessageBox, ElSwitch, ElTag } from 'element-plus';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    /**
     * 解决 vxeTable 在热更新时可能会出错的问题：重复注册 Cell* 渲染器
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        const src = row[column.field];
        return h(ElImage, { src, previewSrcList: [src], ...props });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          ElButton,
          { size: 'small', link: true },
          { default: () => props?.text },
        );
      },
    });

    // 单元格渲染：Tag（状态/类型等）
    vxeUI.renderer.add('CellTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions =
          options ??
          ([
            { label: $t('common.enabled'), type: 'success', value: 1 },
            { label: $t('common.disabled'), type: 'danger', value: 0 },
          ] as Array<Recordable<any>>);

        const tagItem = tagOptions.find((item) => item.value === value);
        const { label, value: _val, color, ...rest } = tagItem ?? {};

        // 兼容 playground 里的 color: 'error' 写法
        const normalized =
          color && !rest.type
            ? { ...rest, type: color === 'error' ? 'danger' : color }
            : rest;

        return h(
          ElTag,
          {
            ...props,
            ...normalized,
          },
          { default: () => label ?? value },
        );
      },
    });

    // 单元格渲染：Switch（带 beforeChange 钩子 + loading）
    vxeUI.renderer.add('CellSwitch', {
      renderTableDefault({ attrs, props }, { column, row }) {
        const loadingKey = `__loading_${column.field}`;

        async function onChange(newVal: any) {
          row[loadingKey] = true;
          try {
            const result = await attrs?.beforeChange?.(newVal, row);
            if (result !== false) {
              row[column.field] = newVal;
            }
          } finally {
            row[loadingKey] = false;
          }
        }

        return h(ElSwitch, {
          activeText: $t('common.enabled'),
          activeValue: 1,
          inactiveText: $t('common.disabled'),
          inactiveValue: 0,
          inlinePrompt: true,
          loading: row[loadingKey] ?? false,
          modelValue: row[column.field],
          size: 'small',
          ...props,
          'onUpdate:modelValue': onChange,
        });
      },
    });

    /**
     * 注册表格的操作按钮渲染器
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = { size: 'small', link: true, ...props };
        let align = 'end';
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'start';
            break;
          }
          default: {
            align = 'end';
            break;
          }
        }

        const presets: Recordable<Recordable<any>> = {
          delete: {
            type: 'danger',
            text: $t('common.delete'),
          },
          edit: {
            type: 'primary',
            text: $t('common.edit'),
          },
        };

        const operations: Array<Recordable<any>> = (
          options || ['edit', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : {
                    code: opt,
                    text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                    ...defaultProps,
                  };
            }
            return { ...defaultProps, ...presets[opt.code], ...opt };
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        function renderBtn(opt: Recordable<any>) {
          // Element Plus ElButton has a boolean `text` prop.
          // Our operation config uses `text` as the button label, so it must NOT
          // be passed through as a component prop to avoid Vue prop warnings.
          const { text, code, icon, ...btnProps } = opt;
          return h(
            ElButton,
            {
              ...props,
              ...btnProps,
              icon: undefined,
              onClick:
                code === 'delete'
                  ? async () => {
                      const nameField = attrs?.nameField || 'name';
                      const nameTitle = attrs?.nameTitle || '';
                      try {
                        await ElMessageBox.confirm(
                          $t('ui.actionMessage.deleteConfirm', [
                            row[nameField],
                          ]),
                          $t('ui.actionTitle.delete', [nameTitle]),
                          { type: 'warning' },
                        );
                        attrs?.onClick?.({ code, row });
                      } catch {
                        // cancel
                      }
                    }
                  : () =>
                      attrs?.onClick?.({
                        code,
                        row,
                      }),
            },
            {
              default: () => {
                const content = [];
                if (icon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-5', icon }),
                  );
                }
                content.push(text);
                return content;
              },
            },
          );
        }

        const btns = operations.map((opt) => renderBtn(opt));
        return h(
          'div',
          {
            class: 'flex table-operations',
            style: { justifyContent: align },
          },
          btns,
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType>>
) => useGrid<T, ComponentType>(...rest);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;

export type * from '@vben/plugins/vxe-table';
