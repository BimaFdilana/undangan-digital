import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { InvitationContent } from "@/lib/content";

export const roleEnum = pgEnum("role", ["admin", "owner"]);
export const statusEnum = pgEnum("invitation_status", ["draft", "published"]);
export const rsvpEnum = pgEnum("rsvp_status", ["pending", "hadir", "tidak"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  // kunci tema di src/themes/registry.ts
  theme: text("theme").notNull().default("geometris"),
  status: statusEnum("status").notNull().default("draft"),
  content: jsonb("content").$type<InvitationContent>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // token acak untuk link unik per tamu
  token: text("token").notNull().unique(),
  phone: text("phone"),
  groupName: text("group_name"),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  openCount: integer("open_count").notNull().default(0),
  rsvp: rsvpEnum("rsvp").notNull().default("pending"),
  pax: integer("pax").notNull().default(1),
  rsvpAt: timestamp("rsvp_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wishes = pgTable("wishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Wish = typeof wishes.$inferSelect;
