import type { Meta, StoryObj } from '@storybook/react'
import { InputField } from './input-field'

const meta = {
  title: 'UI Kit/Формы/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Поле ввода с подписью. Обёртка над Input + Label. Поддерживает опциональное описание под полем.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof InputField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'email@example.com',
  },
}

export const WithDescription: Story = {
  args: {
    label: 'ID проекта',
    placeholder: '0-0',
    description: 'Используйте "0-0" для автоматического определения.',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Отключено',
    placeholder: 'Недоступно',
    disabled: true,
  },
}
