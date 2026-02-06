import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta = {
  title: 'UI Kit/Обратная связь/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Бейдж для отображения статусов, меток и счётчиков. Варианты: default, secondary, destructive, outline.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Бейдж',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Вторичный',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Ошибка',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Контур',
    variant: 'outline',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}
