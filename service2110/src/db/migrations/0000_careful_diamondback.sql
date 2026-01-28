CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" integer PRIMARY KEY NOT NULL,
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"branch_id" integer NOT NULL,
	"branch_name" varchar(255) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"account_mask" varchar(20),
	"account_mask_second_order" varchar(2),
	"currency" varchar(20) NOT NULL,
	"format" varchar(10) NOT NULL,
	"report_type" varchar(10) NOT NULL,
	"source" varchar(20),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"file_size" bigint,
	"file_url" text,
	"error_message" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_6406_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"last_copied_to_tfr_at" timestamp,
	"tasks_count" integer DEFAULT 0 NOT NULL,
	"total_size" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_6406_package_tasks" (
	"package_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_6406_package_tasks_package_id_task_id_pk" PRIMARY KEY("package_id","task_id")
);
--> statement-breakpoint
ALTER TABLE "report_6406_package_tasks" ADD CONSTRAINT "report_6406_package_tasks_package_id_report_6406_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."report_6406_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_6406_package_tasks" ADD CONSTRAINT "report_6406_package_tasks_task_id_report_6406_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."report_6406_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_created_at" ON "report_6406_tasks" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_branch_id" ON "report_6406_tasks" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_status" ON "report_6406_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_report_6406_tasks_period_start" ON "report_6406_tasks" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "idx_report_6406_packages_created_at" ON "report_6406_packages" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_report_6406_packages_name" ON "report_6406_packages" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_report_6406_package_tasks_package_id" ON "report_6406_package_tasks" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "idx_report_6406_package_tasks_task_id" ON "report_6406_package_tasks" USING btree ("task_id");