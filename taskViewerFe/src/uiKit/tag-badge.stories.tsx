import type { Meta, StoryObj } from '@storybook/react'
import { TagBadge } from './tag-badge'
import { TAG_COLOR_OPTIONS } from './tag-colors'

const meta = {
  title: 'UI Kit/Обратная связь/TagBadge',
  component: TagBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Бейдж тега с опциональной палитрой цветов и кнопкой удаления. Используется в списках задач и на странице управления тегами.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tag: { control: 'text' },
    colorKey: {
      control: 'select',
      options: TAG_COLOR_OPTIONS.map((o) => o.value),
    },
    onRemove: { action: 'remove' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TagBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tag: 'тег',
    colorKey: 'blue',
  },
}

export const WithoutColor: Story = {
  args: {
    tag: 'без цвета',
  },
}

export const WithRemove: Story = {
  args: {
    tag: 'удаляемый',
    colorKey: 'green',
    onRemove: () => {},
  },
}

export const WithRemoveDisabled: Story = {
  args: {
    tag: 'заблокировано',
    colorKey: 'red',
    onRemove: () => {},
    disabled: true,
  },
}

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TAG_COLOR_OPTIONS.map((opt) => (
        <TagBadge key={opt.value} tag={opt.label} colorKey={opt.value} />
      ))}
    </div>
  ),
}

export const AllColorsWithRemove: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TAG_COLOR_OPTIONS.map((opt) => (
        <TagBadge
          key={opt.value}
          tag={opt.label}
          colorKey={opt.value}
          onRemove={() => {}}
        />
      ))}
    </div>
  ),
}
