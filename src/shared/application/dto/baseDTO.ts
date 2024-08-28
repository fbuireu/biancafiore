export type BaseDTO<INPUT, OUTPUT, CONFIGURATION = undefined> = {
	create: (raw: INPUT, configuration?: CONFIGURATION) => OUTPUT;
};
