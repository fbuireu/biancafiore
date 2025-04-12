export type BaseDTO<INPUT, OUTPUT, CONFIGURATION = unknown> = {
	create: (raw: INPUT, configuration?: CONFIGURATION) => OUTPUT;
};
