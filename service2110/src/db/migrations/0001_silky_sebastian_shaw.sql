CREATE TYPE "public"."packet_status_enum" AS ENUM('pack_create', 'pack_transfer', 'pack_done', 'pack_fail', 'pack_cancel', 'pack_delete');--> statement-breakpoint
CREATE TABLE "report_6406_package_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_6406_package_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"packet_id" integer NOT NULL,
	"status" "packet_status_enum" NOT NULL,
	"previous_status" "packet_status_enum",
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_6406_package_status_history" ADD CONSTRAINT "report_6406_package_status_history_packet_id_report_6406_packages_id_fk" FOREIGN KEY ("packet_id") REFERENCES "public"."report_6406_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_package_status_history_packet_id" ON "report_6406_package_status_history" USING btree ("packet_id");--> statement-breakpoint
CREATE INDEX "idx_package_status_history_changed_at" ON "report_6406_package_status_history" USING btree ("changed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_package_status_history_status" ON "report_6406_package_status_history" USING btree ("status");