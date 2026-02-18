CREATE TYPE "public"."currency_enum" AS ENUM('RUB', 'FOREIGN');--> statement-breakpoint
CREATE TYPE "public"."file_format_enum" AS ENUM('TXT', 'XLSX', 'XML');--> statement-breakpoint
CREATE TYPE "public"."report_type_enum" AS ENUM('LSOZ', 'LSOS', 'LSOP', 'KROS_VOS', 'KROS_VZS', 'KROS');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"ris" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "report_6406_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_6406_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255),
	"branch_id" integer NOT NULL,
	"branch_name" varchar(255) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"account_mask" varchar(20),
	"account_second_order" varchar(2),
	"currency" "currency_enum" NOT NULL,
	"format" "file_format_enum" NOT NULL,
	"report_type" "report_type_enum" NOT NULL,
	"source" varchar(20),
	"status" varchar(30) DEFAULT 'created' NOT NULL,
	"file_size" bigint,
	"files_count" integer DEFAULT 0 NOT NULL,
	"file_url" text,
	"error_message" text,
	"last_status_changed_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_6406_task_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_6406_task_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" integer NOT NULL,
	"status" varchar(30) NOT NULL,
	"previous_status" varchar(30),
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by" varchar(255),
	"comment" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_6406_task_files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_6406_task_files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" integer NOT NULL,
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
CREATE TABLE "report_6406_packages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_6406_packages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"last_copied_to_tfr_at" timestamp,
	"tasks_count" integer DEFAULT 0 NOT NULL,
	"total_size" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_6406_packages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "report_6406_package_tasks" (
	"package_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_6406_package_tasks_package_id_task_id_pk" PRIMARY KEY("package_id","task_id")
);
--> statement-breakpoint
CREATE TABLE "report_6406_task_branches" (
	"task_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_6406_task_branches_task_id_branch_id_pk" PRIMARY KEY("task_id","branch_id")
);
--> statement-breakpoint
ALTER TABLE "report_6406_tasks" ADD CONSTRAINT "report_6406_tasks_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_task_status_history" ADD CONSTRAINT "report_6406_task_status_history_task_id_report_6406_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_task_files" ADD CONSTRAINT "report_6406_task_files_task_id_report_6406_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_package_tasks" ADD CONSTRAINT "report_6406_package_tasks_package_id_report_6406_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."report_6406_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_package_tasks" ADD CONSTRAINT "report_6406_package_tasks_task_id_report_6406_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_task_branches" ADD CONSTRAINT "report_6406_task_branches_task_id_report_6406_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_task_branches" ADD CONSTRAINT "report_6406_task_branches_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_created_at" ON "report_6406_tasks" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_branch_id" ON "report_6406_tasks" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_status" ON "report_6406_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_period_start" ON "report_6406_tasks" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_created_by" ON "report_6406_tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_last_status_changed_at" ON "report_6406_tasks" USING btree ("last_status_changed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_status_history_task_id" ON "report_6406_task_status_history" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_status_history_changed_at" ON "report_6406_task_status_history" USING btree ("changed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_status_history_status" ON "report_6406_task_status_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_task_files_task_id" ON "report_6406_task_files" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_task_files_status" ON "report_6406_task_files" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_task_files_created_at" ON "report_6406_task_files" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_report_6406_packages_created_at" ON "report_6406_packages" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_report_6406_packages_name" ON "report_6406_packages" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_report_6406_package_tasks_package_id" ON "report_6406_package_tasks" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_report_6406_package_tasks_task_id" ON "report_6406_package_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_report_6406_task_branches_task_id" ON "report_6406_task_branches" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_report_6406_task_branches_branch_id" ON "report_6406_task_branches" USING btree ("branch_id");