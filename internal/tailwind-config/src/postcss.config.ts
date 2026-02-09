import config from '.';

export default {
  plugins: {
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
    // Specifying the config is not necessary in most cases, but it is included
    autoprefixer: {},
    // 修复 element-plus 的样式和 tailwindcss 冲突问题
    'postcss-antd-fixes': { prefixes: ['el'] },
    'postcss-import': {},
    'postcss-preset-env': {},
    tailwindcss: { config },
    'tailwindcss/nesting': {},
  },
};
