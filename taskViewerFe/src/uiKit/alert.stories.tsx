import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './alert'
import { Button } from './button'

const meta = {
  title: 'UI Kit/Обратная связь/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Блок для важных сообщений: ошибки, предупреждения, информация. Варианты: default, destructive, warning, info. Поддерживает title, description, список details и действие (кнопку).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'warning', 'info'],
    },
  },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Заголовок',
    description: 'Текст сообщения или описание.',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Ошибка загрузки',
    description: 'Не удалось загрузить данные. Проверьте подключение и повторите запрос.',
    action: (
      <Button variant="outline" onClick={() => {}}>
        Повторить запрос
      </Button>
    ),
  },
}

export const WithDetails: Story = {
  args: {
    variant: 'destructive',
    title: 'Ошибка валидации',
    description: 'Данные не прошли проверку.',
    details: [
      { path: 'status', message: 'должен быть одним из: backlog, planned', expectedValues: ['backlog', 'planned'] },
      { path: 'priority', message: 'обязательное поле' },
    ],
    action: <Button variant="outline">Исправить</Button>,
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Внимание',
    description: 'Эта операция может занять несколько минут.',
    action: <Button variant="outline">Понятно</Button>,
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Информация',
    description: 'Новая версия приложения доступна. Обновите страницу.',
  },
}
