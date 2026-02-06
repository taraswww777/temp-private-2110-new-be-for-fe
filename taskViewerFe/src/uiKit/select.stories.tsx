import type { Meta, StoryObj } from '@storybook/react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = {
  title: 'UI Kit/Формы/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Выпадающий список для выбора одного значения из набора опций.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

const options = [
  { value: 'draft', label: 'Черновик' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'done', label: 'Готово' },
  { value: 'cancelled', label: 'Отменено' },
]

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Выберите статус" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Выберите фрукт" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {['Яблоко', 'Груша', 'Банан'].map((label) => (
            <SelectItem key={label} value={label.toLowerCase()}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          {['Морковь', 'Свекла'].map((label) => (
            <SelectItem key={label} value={label.toLowerCase()}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Отключено" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Опция 1</SelectItem>
      </SelectContent>
    </Select>
  ),
}
