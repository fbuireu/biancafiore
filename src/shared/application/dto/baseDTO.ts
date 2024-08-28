export type BaseDTO<INPUT, OUTPUT, CONFIGURATION = undefined> = {
	render: (raw: INPUT, configuration?: CONFIGURATION) => OUTPUT;
};
