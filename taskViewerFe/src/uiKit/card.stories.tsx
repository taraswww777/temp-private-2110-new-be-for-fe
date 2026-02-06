import type { Meta, StoryObj } from '@storybook/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card'
import { Button } from './button'

const meta = {
  title: 'UI Kit/Контейнеры/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Карточка для группировки контента. Включает Header, Title, Description, Content и Footer.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Заголовок карточки</CardTitle>
        <CardDescription>Краткое описание содержимого карточки.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Основной контент карточки. Здесь может быть текст, форма или любой другой контент.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Отмена</Button>
        <Button variant="primary">Сохранить</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent className="pt-6">
        <p>Карточка только с контентом без заголовка и футера.</p>
      </CardContent>
    </Card>
  ),
}

export const WithHeaderOnly: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Только заголовок</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Контент под заголовком.</p>
      </CardContent>
    </Card>
  ),
}
