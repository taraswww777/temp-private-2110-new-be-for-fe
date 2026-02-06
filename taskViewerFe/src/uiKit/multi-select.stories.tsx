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
  args: {
    options: defaultOptions,
    selected: ['react', 'vue'],
    onChange: () => {},
  },
  render: function WithSelection(args) {
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

const manyOptionsList = [
  { label: 'Опция 1', value: '1' },
  { label: 'Опция 2', value: '2' },
  { label: 'Опция 3', value: '3' },
  { label: 'Опция 4', value: '4' },
  { label: 'Опция 5', value: '5' },
]

export const ManyOptions: Story = {
  args: {
    options: manyOptionsList,
    selected: [],
    onChange: () => {},
  },
  render: function ManyOptions(args) {
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
