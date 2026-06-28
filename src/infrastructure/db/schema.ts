import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Contact = sqliteTable("Contact", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	message: text("message").notNull(),
	emailId: text("emailId").notNull(),
	createdDate: text("createdDate").notNull(),
	modifiedDate: text("modifiedDate").notNull(),
});

export type ContactRow = typeof Contact.$inferSelect;
export type NewContact = typeof Contact.$inferInsert;
