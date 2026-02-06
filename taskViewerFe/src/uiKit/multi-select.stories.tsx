import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MultiSelect } from './multi-select'

const meta = {
  title: 'UI Kit/Формы/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Множественный выбор из списка опций. Выбранные значения отображаются бейджами, можно снять выбор по крестику или «Снять все».',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof MultiSelect>

export default meta

type Story = StoryObj<typeof meta>

const defaultOptions = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
]

export const Default: Story = {
  args: {
    options: defaultOptions,
    selected: [],
    onChange: () => {},
    placeholder: 'Выберите технологии...',
  },
  render: function DefaultMultiSelect(args) {
    const [selected, setSelected] = React.useState<string[]>(args.selected)
    return (
      <div className="w-[280px]">
        <MultiSelect
          {...args}
          selected={selected}
          onChange={setSelected}
        />
      </div>
    )
  },
}

export const WithSelection: Story = {
  render: function WithSelection() {
    const [selected, setSelected] = React.useState<string[]>(['react', 'vue'])
    return (
      <div className="w-[280px]">
        <MultiSelect
          options={defaultOptions}
          selected={selected}
          onChange={setSelected}
          placeholder="Выберите технологии..."
        />
      </div>
    )
  },
}

export const ManyOptions: Story = {
  render: function ManyOptions() {
    const options = [
      { label: 'Опция 1', value: '1' },
      { label: 'Опция 2', value: '2' },
      { label: 'Опция 3', value: '3' },
      { label: 'Опция 4', value: '4' },
      { label: 'Опция 5', value: '5' },
    ]
    const [selected, setSelected] = React.useState<string[]>([])
    return (
      <div className="w-[280px]">
        <MultiSelect
          options={options}
          selected={selected}
          onChange={setSelected}
          placeholder="Выберите несколько..."
        />
      </div>
    )
  },
}
