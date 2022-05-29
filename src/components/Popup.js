import React, { useState, useContext } from "react";
import { Context } from "./context/context";
import "../styles/popup/popup.css";

export default function Popup(props) {
	const { state, dispatch } = useContext(Context);
	const [label, setLabel] = useState(null);

	return (
		<div
			id="popup"
			className="popup_container"
			style={{ top: `${props.startY}px`, left: `${props.startX}px` }}
		>
			<div style={{ padding: "0" }} className="title">
				Please enter the label of this object.
			</div>
			<input
				type="number"
				value={label ? label : ""}
				className="label__input"
				onChange={(e) => {
					console.log(e.target.value);
					setLabel(e.target.value);
				}}
			/>
			<div className="buttons">
				<button
					className="cancel__btn"
					onClick={() => {
						// props.addToObjects(false, props.top, props.left, props.startX, props.startY, null);
						dispatch({ type: "SET_POPUP", popup: false });
					}}
				>
					Cancel
				</button>
				<button
					className="Ok__btn"
					onClick={() => {
						if (label) {
							console.log("adding", props.currentBox);
							const rect = props.currentBox;
							rect.push(label);
							dispatch({ type: "ADD_BOX", index: state.currentFileIndex, box: rect });
							dispatch({ type: "SET_POPUP", popup: false });
							props.setCurrentBox({});
						} else {
							alert("Please enter label and click OK");
						}
					}}
				>
					Ok
				</button>
			</div>
		</div>
	);
}
