import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'

const meta = {
  title: 'UI Kit/Формы/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Подпись для полей формы. Связывается с полем через htmlFor и id.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Подпись поля',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">Имя</Label>
      <Input id="name" placeholder="Введите имя" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="required">
        Обязательное поле <span className="text-destructive">*</span>
      </Label>
      <Input id="required" placeholder="Обязательно для заполнения" required />
    </div>
  ),
}
