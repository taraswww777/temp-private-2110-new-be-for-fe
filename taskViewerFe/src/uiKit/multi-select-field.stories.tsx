import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MultiSelectField } from './multi-select-field'

const meta = {
  title: 'UI Kit/Формы/MultiSelectField',
  component: MultiSelectField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Множественный выбор с подписью. Обёртка над MultiSelect + Label.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof MultiSelectField>

export default meta

type Story = StoryObj<typeof meta>

const defaultOptions = [
  { label: '📋 Бэклог', value: 'backlog' },
  { label: '📅 Запланировано', value: 'planned' },
  { label: '⏳ В работе', value: 'in-progress' },
  { label: '✅ Выполнено', value: 'completed' },
]

export const Default: Story = {
  args: {
    label: 'Статус',
    options: defaultOptions,
    selected: [],
    onChange: () => {},
    placeholder: 'Все статусы',
  },
  render: function DefaultStory(args) {
    const [selected, setSelected] = React.useState<string[]>(args.selected)
    return (
      <div className="w-[280px]">
        <MultiSelectField
          {...args}
          selected={selected}
          onChange={setSelected}
        />
      </div>
    )
  },
}

export const WithSelection: Story = {
  args: {
    label: 'Приоритет',
    options: [
      { label: '🔴 Критический', value: 'critical' },
      { label: '🟠 Высокий', value: 'high' },
      { label: '🔵 Средний', value: 'medium' },
      { label: '⚪ Низкий', value: 'low' },
    ],
    selected: ['high', 'critical'],
    onChange: () => {},
    placeholder: 'Все приоритеты',
  },
  render: function WithSelectionStory(args) {
    const [selected, setSelected] = React.useState<string[]>(args.selected)
    return (
      <div className="w-[280px]">
        <MultiSelectField
          {...args}
          selected={selected}
          onChange={setSelected}
        />
      </div>
    )
  },
}
