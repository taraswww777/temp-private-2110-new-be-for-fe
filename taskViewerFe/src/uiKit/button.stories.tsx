import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI Kit/Обратная связь/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Кнопка с вариантами стиля и размера. Используется для действий в формах и навигации.\n\n**Варианты (variant):**\n- **primary** — основное действие\n- **secondary** — второстепенное\n- **success** — успех, подтверждение\n- **danger** — опасное действие (удалить)\n- **warning** — предупреждение\n- **info** — информация, подсказка\n- outline, ghost, link — дополнительные стили\n\n**Размеры (size):** default, sm, lg, icon.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'default', 'outline', 'ghost', 'link', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Кнопка',
    variant: 'primary',
    size: 'default',
  },
}

/** Все варианты кнопки в одном месте. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary">primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="success">success</Button>
        <Button variant="danger">danger</Button>
        <Button variant="warning">warning</Button>
        <Button variant="info">info</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">sm</Button>
        <Button size="default">default</Button>
        <Button size="lg">lg</Button>
        <Button size="icon">🔔</Button>
      </div>
    </div>
  ),
}
