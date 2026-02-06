import type { Meta, StoryObj } from '@storybook/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'
import { Button } from './button'

const meta = {
  title: 'UI Kit/Overlay/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Модальное окно для подтверждений, форм и важного контента. Открывается по клику на триггер.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Открыть диалог</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заголовок диалога</DialogTitle>
          <DialogDescription>
            Краткое описание. Здесь можно объяснить, зачем открыт диалог и что от пользователя требуется.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Контент модального окна.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button variant="primary">Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const ConfirmDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">Удалить</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogDescription>
            Это действие нельзя отменить. Вы уверены?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button variant="danger">Удалить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
