export type BaseDTO<INPUT, OUTPUT, RETURN_TYPE = OUTPUT, CONFIG = undefined> = {
	render: (raw: INPUT, configuration?: CONFIG) => RETURN_TYPE;
};
