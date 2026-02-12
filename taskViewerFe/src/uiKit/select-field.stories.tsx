import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SelectField } from './select-field'

const meta = {
  title: 'UI Kit/Формы/SelectField',
  component: SelectField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Выпадающий список с подписью. Обёртка над Select + Label. Принимает массив опций { label, value }.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SelectField>

export default meta

type Story = StoryObj<typeof meta>

const statusOptions = [
  { label: 'Черновик', value: 'draft' },
  { label: 'В работе', value: 'in-progress' },
  { label: 'Готово', value: 'done' },
  { label: 'Отменено', value: 'cancelled' },
]

export const Default: Story = {
  args: {
    label: 'Статус',
    options: statusOptions,
    value: '',
    onValueChange: () => {},
    placeholder: 'Выберите статус',
  },
  render: function DefaultStory(args) {
    const [value, setValue] = React.useState(args.value ?? '')
    return (
      <div className="w-[280px]">
        <SelectField
          {...args}
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const WithValue: Story = {
  args: {
    label: 'Статус',
    options: statusOptions,
    value: 'in-progress',
    onValueChange: () => {},
    placeholder: 'Выберите статус',
  },
  render: function WithValueStory(args) {
    const [value, setValue] = React.useState(args.value ?? '')
    return (
      <div className="w-[280px]">
        <SelectField
          {...args}
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    label: 'Отключено',
    options: statusOptions,
    value: 'draft',
    disabled: true,
    placeholder: 'Выберите',
  },
}
