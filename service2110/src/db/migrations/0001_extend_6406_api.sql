-- Добавление новых полей в таблицу report_6406_tasks
ALTER TABLE "report_6406_tasks" 
  ADD COLUMN "created_by" varchar(255),
  ADD COLUMN "files_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "last_status_changed_at" timestamp DEFAULT now() NOT NULL,
  ADD COLUMN "started_at" timestamp,
  ADD COLUMN "completed_at" timestamp;
--> statement-breakpoint

-- Обновление статусов: расширяем поле status до 30 символов и меняем дефолтное значение
ALTER TABLE "report_6406_tasks" 
  ALTER COLUMN "status" TYPE varchar(30),
  ALTER COLUMN "status" SET DEFAULT 'created';
--> statement-breakpoint

-- Создание таблицы для истории статусов заданий
CREATE TABLE "report_6406_task_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"status" varchar(30) NOT NULL,
	"previous_status" varchar(30),
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by" varchar(255),
	"comment" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Создание таблицы для файлов заданий
CREATE TABLE "report_6406_task_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" bigint NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"storage_url" text NOT NULL,
	"download_url" text,
	"download_url_expires_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Добавление foreign key constraints
ALTER TABLE "report_6406_task_status_history" 
  ADD CONSTRAINT "report_6406_task_status_history_task_id_report_6406_tasks_id_fk" 
  FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "report_6406_task_files" 
  ADD CONSTRAINT "report_6406_task_files_task_id_report_6406_tasks_id_fk" 
  FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Создание индексов для report_6406_tasks
CREATE INDEX "idx_report_6406_tasks_created_by" ON "report_6406_tasks" USING btree ("created_by");
--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_last_status_changed_at" ON "report_6406_tasks" USING btree ("last_status_changed_at" DESC NULLS LAST);
--> statement-breakpoint

-- Создание индексов для report_6406_task_status_history
CREATE INDEX "idx_status_history_task_id" ON "report_6406_task_status_history" USING btree ("task_id");
--> statement-breakpoint
CREATE INDEX "idx_status_history_changed_at" ON "report_6406_task_status_history" USING btree ("changed_at" DESC NULLS LAST);
--> statement-breakpoint
CREATE INDEX "idx_status_history_status" ON "report_6406_task_status_history" USING btree ("status");
--> statement-breakpoint

-- Создание индексов для report_6406_task_files
CREATE INDEX "idx_task_files_task_id" ON "report_6406_task_files" USING btree ("task_id");
--> statement-breakpoint
CREATE INDEX "idx_task_files_status" ON "report_6406_task_files" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "idx_task_files_created_at" ON "report_6406_task_files" USING btree ("created_at" DESC NULLS LAST);
