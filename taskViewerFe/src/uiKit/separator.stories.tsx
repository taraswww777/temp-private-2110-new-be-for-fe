import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta = {
  title: 'UI Kit/Контейнеры/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Разделитель для визуального отделения блоков. Горизонтальный или вертикальный.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-[300px]">
      <p className="text-sm text-muted-foreground">Выше разделитель</p>
      <Separator {...args} className="my-4" />
      <p className="text-sm text-muted-foreground">Ниже разделитель</p>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-20 items-center gap-4">
      <span>Слева</span>
      <Separator {...args} />
      <span>Справа</span>
    </div>
  ),
}
