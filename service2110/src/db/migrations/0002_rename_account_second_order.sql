-- TASK-014: переименование account_mask_second_order → account_second_order (счета второго порядка)
ALTER TABLE "report_6406_tasks" RENAME COLUMN "account_mask_second_order" TO "account_second_order";
