import React, { useState, useContext } from "react";
import { Context } from "./context/context";
import Utils from "./Utils";
import "../styles/popup/popup.css";

export default function Popup(props) {
	const { state, dispatch } = useContext(Context);
	const [label, setLabel] = useState(0);
	const utils = new Utils(state, dispatch);

	return (
		<div
			id="popup"
			className="popup_container"
			style={{ top: `${props.startY}px`, left: `${props.startX}px` }}
		>
			<div style={{ padding: "0" }} className="title">
				Please select the class of current object.
			</div>

			<select
				name="label_select"
				id="label_select"
				value={state.colors[label]}
				onChange={(e) => {
					console.log(e.target.value);
					setLabel(state.colors.indexOf(e.target.value));
				}}
			>
				{state.colors.map((color, i) => {
					return (
						<option key={color} value={color}>
							Class {i}
						</option>
					);
				})}
			</select>
			<div className="buttons">
				<button
					className="cancel__btn"
					onClick={() => {
						// props.addToObjects(false, props.top, props.left, props.startX, props.startY, null);
						dispatch({ type: "SET_POPUP", popup: false });
						dispatch({ type: "SET_TMP_BOX", tmpBox: null });
						utils.undo();
					}}
				>
					Cancel
				</button>
				<button
					className="Ok__btn"
					onClick={() => {
						if (label >= 0) {
							console.log("temp", props.currentBox);
							dispatch({
								type: "ADD_BOX",
								index: state.currentFileIndex,
								box: { ...props.currentBox, color: state.colors[label], label: label },
							});
							dispatch({ type: "SET_POPUP", popup: false });
							dispatch({ type: "SET_TMP_BOX", tmpBox: null });
							utils.reRender();
						} else {
							alert("Please select class and click OK");
						}
					}}
				>
					Ok
				</button>
			</div>
		</div>
	);
}
