import { Infinite } from "@assets/images/svg-components/infinite";
import type { JSX, SVGProps } from "react";
import "./spinner.css";

type SpinnerProps = SVGProps<SVGSVGElement>;

const Spinner = ({ ...props }: SpinnerProps): JSX.Element => <Infinite classNames="spinner" {...props} />;

export default Spinner;
