ALTER TABLE "drawings" ADD COLUMN "created_by" varchar(255);--> statement-breakpoint
CREATE TABLE "drawing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawing_id" uuid NOT NULL,
	"data" bytea NOT NULL,
	"mime_type" varchar(40) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drawing_images_drawing_id_unique" UNIQUE("drawing_id")
);--> statement-breakpoint
ALTER TABLE "drawing_images" ADD CONSTRAINT "drawing_images_drawing_id_drawings_id_fk" FOREIGN KEY ("drawing_id") REFERENCES "public"."drawings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawings" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "drawings" DROP COLUMN "image_key";
