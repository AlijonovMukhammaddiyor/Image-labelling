import React, { useMemo, useEffect, useContext, useState } from "react";
import Popup from "./Popup";
import { Context } from "./context/context";
import Utils from "./Utils";
import "../styles/app/app.css";

export default function App() {
	const { state, dispatch } = useContext(Context);
	const [currentBox, setCurrentBox] = useState([]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const utils = useMemo(() => new Utils(state, dispatch), [state]);

	useEffect(() => {
		const canvas = document.getElementById("canvas");
		const input = document.getElementById("input");
		canvas.height = input.clientHeight;
		canvas.width = input.clientWidth;
		// eslint-disable-next-line react-hooks/exhaustive-deps

		window.addEventListener("resize", () => {
			utils.setBackground();
		});

		return () => {
			window.removeEventListener("resize", () => {
				utils.setBackground();
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		utils.setBackground();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.files, state.currentFileindex]);

	useEffect(() => {
		utils.setBackground();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.files, state.currentFileIndex]);

	return (
		<div className="app__container">
			<div className="header"></div>
			<main
				id="main"
				onMouseDown={(e) => {
					handleMouseDown(e);
				}}
				onMouseMove={(e) => {
					if (state.files.length > 0) handleMouseMove(e);
					trackMousePos(e);
				}}
				onMouseUp={(e) => {
					handleMouseUp(e);
				}}
				onMouseOut={(e) => {
					handleMouseOut(e);
				}}
			>
				<div className="input__container" id="input">
					<input
						id="fileInput"
						type="file"
						style={{ display: "none" }}
						className="input__upload__pic"
						accept=".zip,.rar,.7zip"
						onChange={(e) => {
							utils.handleUpload(e.target.files);
						}}
					/>
					<canvas id="canvas"></canvas>
					{state.popup && <Popup currentBox={currentBox} setCurrentBox={setCurrentBox} />}
				</div>
				<div className="footer">
					{state.files.length > 0 ? (
						<div className="download__btns">
							<button className="download" onClick={(e) => utils.download(e)}>
								Download
							</button>
							<button className="download txt" onClick={(e) => utils.downloadTextFile()}>
								Download .txt
							</button>
						</div>
					) : (
						<label className="upload" htmlFor="fileInput">
							<p className="upload__button" onClick={() => {}}>
								Upload Image
							</p>
						</label>
					)}
					<div className="zooms">
						<button
							onClick={() => {
								// zoomInOut(true);
							}}
							className="zoom__in zoom"
						>
							+
						</button>
						<button
							onClick={() => {
								// zoomInOut(false);
							}}
							className="zoom__out zoom"
						>
							-
						</button>
						<button
							onClick={() => {
								if (state.currentFileIndex >= 0 && state.currentFileIndex < state.files.length) {
									const blob = utils.dataURLtoBlob(document.getElementById("canvas").toDataURL());
									dispatch({
										type: "CHANGE_FILE",
										index: state.currentFileIndex,
										file: URL.createObjectURL(blob),
									});
								}
								console.log(state);
								dispatch({ type: "PREV_FILE" });
							}}
							className="prev__image"
						>
							Prev
						</button>
						<button
							onClick={() => {
								if (state.currentFileIndex >= 0 && state.currentFileIndex < state.files.length) {
									const blob = utils.dataURLtoBlob(document.getElementById("canvas").toDataURL());
									dispatch({
										type: "CHANGE_FILE",
										index: state.currentFileIndex,
										file: URL.createObjectURL(blob),
									});
								}
								console.log(state);
								dispatch({ type: "NEXT_FILE" });
							}}
							className="next__image"
						>
							Next
						</button>
						<button
							className="undo"
							onClick={() => {
								utils.undo(true);
							}}
						>
							Undo
						</button>
					</div>
				</div>
			</main>
		</div>
	);

	function handleMouseDown(e) {
		if (state.files.length > 0) {
			const { canvas } = utils.getCanvasAndCtx();
			canvas.style.cursor = "crosshair";

			dispatch({ type: "SET_DRAWING", isDrawing: true });
			const clickedArea = utils.findCurrentArea(e.offsetX, e.offsetY);
			dispatch({ type: "SET_CLICKED_AREA", clickedArea });
			dispatch({
				type: "SET_START",
				startX: state.mouseX,
				startY: state.mouseY,
			});
			dispatch({ type: "SET_MOUSEMOVE", didMouseMove: false });
		}
	}

	function handleMouseMove(e) {
		if (state.isDrawing && state.files.length > 0) {
			const { canvas, ctx } = utils.getCanvasAndCtx();

			ctx.strokeStyle = "DeepSkyBlue";
			const img = new Image();
			img.src = state.files[state.currentFileIndex][1];

			img.onload = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.save();

				if (img.height > canvas.height || img.width > canvas.width) {
					utils.coverImg(img, "contain");
				} else {
					ctx.globalCompositeOperation = "destination-over";
					ctx.drawImage(img, 0, 0);
				}
				ctx.restore();
				ctx.beginPath();

				ctx.lineWidth = 2;
				ctx.rect(
					state.startX,
					state.startY,
					state.mouseX - state.startX,
					state.mouseY - state.startY
				);

				ctx.stroke();
				console.log(state.currentFileIndex, state.boxes[state.currentFileIndex]);
				for (let i = 0; i < state.boxes[state.currentFileIndex].length; i++) {
					ctx.beginPath();
					ctx.rect(
						state.boxes[state.currentFileIndex][i][0],
						state.boxes[state.currentFileIndex][i][1],
						state.boxes[state.currentFileIndex][i][2] - state.boxes[state.currentFileIndex][i][0],
						state.boxes[state.currentFileIndex][i][3] - state.boxes[state.currentFileIndex][i][1]
					);
					ctx.stroke();
				}

				ctx.stroke();
				dispatch({ type: "SET_MOUSEMOVE", didMouseMove: true });
			};
			img.onerror = (err) => {
				console.log("img error");
				console.error(err);
			};
		} else {
			dispatch({ type: "SET_MOUSEMOVE", didMouseMove: false });
		}
	}

	function handleMouseUp(e) {
		const { canvas } = utils.getCanvasAndCtx();
		dispatch({ type: "SET_DRAWING", isDrawing: false });
		if (state.didMouseMove) {
			console.log(state);
			setCurrentBox([state.startX, state.startY, state.mouseX, state.mouseY]);
			dispatch({ type: "SET_POPUP", popup: true });
			dispatch({ type: "SET_MOUSEMOVE", didMouseMove: false });
		}

		canvas.style.cursor = "default";
	}

	function handleMouseOut(e) {
		// console.log("mouse out");
		// dispatch({ type: "SET_MOUSE", mouseX: -1, mouseY: -1 });
		// dispatch({ type: "SET_DRAWING", isDrawing: false });
	}

	function trackMousePos(e) {
		const main = document.getElementById("main");
		var mousePos = { x: e.clientX - main.offsetLeft, y: e.clientY - main.offsetTop };
		dispatch({ type: "SET_MOUSE", mouseX: mousePos.x, mouseY: mousePos.y });
	}
}
