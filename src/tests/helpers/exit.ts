import { Cause, Exit, Option, Result } from "effect";

export const failureOf = <E>(exit: Exit.Exit<unknown, E>): E | undefined =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.findErrorOption(exit.cause)) : undefined;

export const defectOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Result.getOrUndefined(Cause.findDefect(exit.cause)) : undefined;
