-- TASK-043: Обновление таблицы branches для добавления codeCB и codeDAPP
ALTER TABLE "branches" 
  RENAME COLUMN "code" TO "code_cb";

ALTER TABLE "branches" 
  ADD COLUMN "code_dapp" varchar(10);

UPDATE "branches" SET "code_dapp" = "code_cb";

ALTER TABLE "branches" 
  ALTER COLUMN "code_dapp" SET NOT NULL;

ALTER TABLE "branches" 
  ADD CONSTRAINT "branches_code_cb_unique" UNIQUE("code_cb");

ALTER TABLE "branches" 
  ADD CONSTRAINT "branches_code_dapp_unique" UNIQUE("code_dapp");