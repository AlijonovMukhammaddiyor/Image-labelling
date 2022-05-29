import React, { useState, useContext } from "react";
import { Context } from "./context/context";
import "../styles/labels/labels.css";

export default function Labels(props) {
	const { dispatch } = useContext(Context);
	const [value, setValue] = useState(0);

	return (
		<div className="labels__container">
			<div className="title_labels">Enter number of classes</div>
			<input
				className="input"
				type="number"
				min={1}
				value={value}
				onChange={(e) => {
					setValue(e.target.valueAsNumber);
				}}
			/>

			<button
				onClick={() => {
					if (value > 0 && value < 143) {
						dispatch({ type: "INIT_LABELS", length: value });
						dispatch({ type: "SET_LABELPROMPT", label: false });
					} else if (value <= 0) {
						setValue(0);
						alert("PLease enter valid number");
					} else {
						setValue(0);
						alert("Value is too big");
					}
				}}
			>
				OK
			</button>
		</div>
	);
}
