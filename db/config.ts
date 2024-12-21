import { column, defineDb, defineTable } from "astro:db";

const Contact = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		name: column.text(),
		email: column.text(),
		message: column.text(),
		date: column.text(),
	},
});

export default defineDb({
	tables: { Contact },
});
