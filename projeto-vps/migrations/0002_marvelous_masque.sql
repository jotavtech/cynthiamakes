ALTER TABLE "products" RENAME COLUMN "brand" TO "brand_id";--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "image_url" text DEFAULT '';