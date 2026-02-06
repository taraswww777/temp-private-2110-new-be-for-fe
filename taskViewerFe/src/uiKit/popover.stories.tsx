import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = {
  title: 'UI Kit/Overlay/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Всплывающая панель для дополнительного контента, подсказок или выбора. Открывается по клику.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Открыть popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-2">
          <h4 className="font-medium leading-none">Заголовок</h4>
          <p className="text-sm text-muted-foreground">
            Текст во всплывающей панели. Можно разместить форму, список или подсказку.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Настройки</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Параметры</h4>
          <div className="grid gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" /> Опция 1
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" /> Опция 2
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
