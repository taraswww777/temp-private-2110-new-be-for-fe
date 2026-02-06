import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI Kit/Формы/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Поле ввода текста. Поддерживает placeholder, disabled, type (text, email, password и др.).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
    type: 'text',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
}

export const WithValue: Story = {
  args: {
    defaultValue: 'Заполненное поле',
    type: 'text',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Отключено',
    disabled: true,
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Пароль',
  },
}

export const ErrorState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="error">Поле с ошибкой</Label>
      <Input
        id="error"
        className="border-destructive focus-visible:ring-destructive"
        placeholder="Неверное значение"
        defaultValue="invalid@"
      />
      <p className="text-sm text-destructive">Введите корректный email</p>
    </div>
  ),
}
