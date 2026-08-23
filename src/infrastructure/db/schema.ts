import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Contact = sqliteTable(
	"Contact",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		message: text("message").notNull(),
		emailId: text("emailId").notNull(),
		createdDate: text("createdDate").notNull(),
		modifiedDate: text("modifiedDate").notNull(),
	},
	(table) => [index("Contact_email_createdDate_idx").on(table.email, table.createdDate)],
);

export type ContactRow = typeof Contact.$inferSelect;
export type NewContact = typeof Contact.$inferInsert;
