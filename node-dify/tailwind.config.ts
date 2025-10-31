import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Workflow 관련 CSS 변수
        'workflow-block-border': 'var(--color-workflow-block-border)',
        'workflow-block-parma-bg': 'var(--color-workflow-block-parma-bg)',
        'workflow-block-bg': 'var(--color-workflow-block-bg)',
        'workflow-block-bg-transparent': 'var(--color-workflow-block-bg-transparent)',
        'workflow-block-border-highlight': 'var(--color-workflow-block-border-highlight)',

        // Link line colors
        'workflow-link-line-active': 'var(--color-workflow-link-line-active)',
        'workflow-link-line-normal': 'var(--color-workflow-link-line-normal)',
        'workflow-link-line-handle': 'var(--color-workflow-link-line-handle)',
        'workflow-link-line-success-active': 'var(--color-workflow-link-line-success-active)',
        'workflow-link-line-success-handle': 'var(--color-workflow-link-line-success-handle)',
        'workflow-link-line-error-active': 'var(--color-workflow-link-line-error-active)',
        'workflow-link-line-error-handle': 'var(--color-workflow-link-line-error-handle)',
        'workflow-link-line-failure-active': 'var(--color-workflow-link-line-failure-active)',
        'workflow-link-line-failure-handle': 'var(--color-workflow-link-line-failure-handle)',

        // State colors
        'state-accent-solid': '#2E90FA',
        'state-success-solid': '#17B26A',
        'state-destructive-solid': '#EF4444',
        'state-warning-solid': '#F79009',

        // Text colors
        'text-primary': '#101828',
        'text-secondary': '#344054',
        'text-tertiary': '#667085',
        'text-accent': '#2970FF',
        'text-success': '#17B26A',
        'text-destructive': '#EF4444',

        // Util colors for node icons
        'util-colors-blue-brand-blue-brand-500': '#2970FF',
        'util-colors-indigo-indigo-500': '#6366F1',
        'util-colors-blue-blue-500': '#3B82F6',
        'util-colors-warning-warning-500': '#F79009',
        'util-colors-cyan-cyan-500': '#06B6D4',
        'util-colors-violet-violet-500': '#8B5CF6',
        'util-colors-green-green-500': '#10B981',
      },
      borderRadius: {
        '15': '15px',
      },
      boxShadow: {
        'xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'sm': '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
        'md': '0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10)',
        'lg': '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
