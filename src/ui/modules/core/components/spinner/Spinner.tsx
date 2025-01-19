import { Infinite } from "@assets/images/svg-components/infinite";
import type { SVGProps } from "react";
import "./spinner.css";

type SpinnerProps = SVGProps<SVGSVGElement>;

const Spinner = ({ ...props }: SpinnerProps) => <Infinite classNames="spinner" {...props} />;

export default Spinner;
