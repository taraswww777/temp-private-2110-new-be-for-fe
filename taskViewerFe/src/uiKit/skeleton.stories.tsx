import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta = {
  title: 'UI Kit/Обратная связь/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Плейсхолдер загрузки с анимацией pulse. Задайте размер через className (h-*, w-*, и т.д.).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'h-12 w-64',
  },
}

export const Lines: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
}

export const PagePlaceholder: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  ),
}

export const CardPlaceholder: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  ),
}
