CREATE TABLE "about_me" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"short_title" varchar(120) NOT NULL,
	"short_description" varchar(500) NOT NULL,
	"full_title" varchar(160) NOT NULL,
	"subtitle" varchar(240),
	"content" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "about_me_image" (
	"about_me_id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"data" "bytea" NOT NULL,
	"mime_type" varchar(40) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drawings" ADD COLUMN "likes_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "about_me_image" ADD CONSTRAINT "about_me_image_about_me_id_about_me_id_fk" FOREIGN KEY ("about_me_id") REFERENCES "public"."about_me"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "about_me" ("id", "short_title", "short_description", "full_title", "subtitle", "content") VALUES (
	1,
	'¡Hola! Soy Naty 💜',
	'Dibujar es mi forma favorita de expresar mis ideas y crear mundos llenos de color.',
	'¡Hola! Soy Naty',
	'Este es mi pequeño mundo creativo.',
	'Me encanta dibujar personajes, inventar historias y probar colores nuevos. Este rincón guarda mis creaciones y me ayuda a ver cuánto aprendo con el tiempo.\n\nCuando no estoy dibujando, busco nuevas ideas en las cosas que me hacen sonreír. Aquí comparto solamente mi arte, de forma segura y con mucho cariño.'
);
