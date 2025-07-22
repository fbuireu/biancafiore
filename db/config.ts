import { column, defineDb, defineTable } from "astro:db";

const Contact = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		name: column.text(),
		email: column.text({ unique: true }),
		message: column.text({ multiline: true }),
		emailId: column.text(),
		createdDate: column.text(),
		modifiedDate: column.text(),
	},
});

export default defineDb({
	tables: { Contact },
});
