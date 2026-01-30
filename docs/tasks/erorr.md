/api/v1/report-6406/tasks/ Сздать новое задание на построение отчета
Request body
Есть обязательные поля для создания
currency* - не обязательное поле для создания
"source": "string" - разве не выпадающий список из справочника?




Responses
 "canCancel": true,
  "canDelete": true,
  "canStart": true,
  Эти параметры будут приходить прии создании?

  


  /api/v1/report-6406/tasks/ Получить список заданий с пагинацией и фильтраицей
Responses
"pagination": {
    "page": 9007199254740991,
    "limit": 100,   - много


/api/v1/report-6406/tasks/bulk-cancel  массовая отмена заданий

"taskIds": - на выходе 
cancelled* -  - для передачи в очередь?





- это массовая отмена, значит это массив??



/api/v1/report-6406/tasks/start Запустить задания на выполнение 






/api/v1/report-6406/packages/Создать новый пакет
totalSize*	integer
minimum: 0
maximum: 9007199254740991


/api/v1/report-6406/tasks/ Создать новое задание на построение оттчета
fileSize*	{
anyOf ->	
number
null

/api/v1/report-6406/tasks/{id} Детали
fileSize*	{
anyOf ->	
number
null
}

------не совпадают форматы размеров





/api/v1/report-6406/tasks/{id} Получить детальную информациб о задании
createdBy*	{
anyOf ->	
string
null - почему? Задание может к нам прийти автоматиески без участия пользователя?


Report 6406 - Storage
Мониторинг хранилища отчётов 

Будет ли разделение: корзина для ... , розина для ТФР



/api/v1/report-6406/tasks/  Получить список заданий с пагинацией и фильтрацией
В запросе ьудут указаны параметры sortBy?, первые 20 записей 
