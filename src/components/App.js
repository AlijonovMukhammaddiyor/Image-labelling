import React, { useMemo, useEffect, useContext, useState } from "react";
import Popup from "./Popup";
import { Context } from "./context/context";
import Utils from "./Utils";
import Labels from "./Labels";
import "../styles/app/app.css";

export default function App() {
	const { state, dispatch } = useContext(Context);
	const [currentBox, setCurrentBox] = useState([]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const utils = useMemo(() => new Utils(state, dispatch), [state]);
	const MAX_ZOOM = 5;
	const MIN_ZOOM = 0.1;
	const SCROLL_SENSITIVITY = 0.0005;

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
					{state.labelPrompt && <Labels />}
					{state.popup && <Popup currentBox={currentBox} />}
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
		if (state.files.length > 0 && !state.popup) {
			const { canvas } = utils.getCanvasAndCtx();
			canvas.style.cursor = "crosshair";

			dispatch({ type: "SET_DRAWING", isDrawing: true });
			const clickedArea = utils.findCurrentArea(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
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

				if (state.clickedArea.box === -1) {
					utils.redraw();
				}
				if (state.clickedArea.box !== -1) {
					const xOffset = state.mouseX - state.startX;
					const yOffset = state.mouseY - state.startY;

					dispatch({ type: "SET_START", startX: state.mouseX, startY: state.mouseY });
					const temp = state.boxes[state.currentFileIndex];
					if (
						state.clickedArea.pos === "i" ||
						state.clickedArea.pos === "tl" ||
						state.clickedArea.pos === "l" ||
						state.clickedArea.pos === "bl"
					) {
						temp[state.clickedArea.box].x1 += xOffset;
					}
					if (
						state.clickedArea.pos === "i" ||
						state.clickedArea.pos === "tl" ||
						state.clickedArea.pos === "t" ||
						state.clickedArea.pos === "tr"
					) {
						temp[state.clickedArea.box].y1 += yOffset;
						// boxes[clickedArea.box].y1 += yOffset;
					}
					if (
						state.clickedArea.pos === "i" ||
						state.clickedArea.pos === "tr" ||
						state.clickedArea.pos === "r" ||
						state.clickedArea.pos === "br"
					) {
						temp[state.clickedArea.box].x2 += xOffset;
						// boxes[clickedArea.box].x2 += xOffset;
					}
					if (
						state.clickedArea.pos === "i" ||
						state.clickedArea.pos === "bl" ||
						state.clickedArea.pos === "b" ||
						state.clickedArea.pos === "br"
					) {
						temp[state.clickedArea.box].y2 += yOffset;
						// boxes[clickedArea.box].y2 += yOffset;
					}

					dispatch({ type: "SET_BOXES", boxes: temp });
					console.log("redrawing 2");
					utils.redraw();
				}

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

		if (state.clickedArea.box === -1 && state.tmpBox != null) {
			dispatch({ type: "SET_POPUP", popup: true });
			setCurrentBox(state.tmpBox);
			// dispatch({ type: "ADD_BOX", index: state.currentFileIndex, box: state.tmpBox });
		} else if (state.clickedArea.box !== -1) {
			var selectedBox = state.boxes[state.currentFileIndex][state.clickedArea.box];
			if (selectedBox.x1 > selectedBox.x2) {
				var previousX1 = selectedBox.x1;
				selectedBox.x1 = selectedBox.x2;
				selectedBox.x2 = previousX1;
			}
			if (selectedBox.y1 > selectedBox.y2) {
				var previousY1 = selectedBox.y1;
				selectedBox.y1 = selectedBox.y2;
				selectedBox.y2 = previousY1;
			}

			dispatch({ type: "SET_TMP_BOX", tmpBox: null });
		}
		dispatch({ type: "SET_MOUSEMOVE", didMouseMove: false });

		dispatch({
			type: "SET_CLICKED_AREA",
			clickedArea: {
				box: -1,
				pos: "o",
			},
		});

		dispatch({ type: "SET_DRAWING", isDrawing: false });

		canvas.style.cursor = "default";
	}

	function handleMouseOut(e) {
		// console.log("mouse out");
		// dispatch({ type: "SET_MOUSE", mouseX: -1, mouseY: -1 });
		// dispatch({ type: "SET_DRAWING", isDrawing: false });
		if (state.clickedArea.box !== -1) {
			const boxes = state.boxes[state.currentFileIndex];
			let selectedBox = boxes[state.clickedArea.box];
			if (selectedBox.x1 > selectedBox.x2) {
				let previousX1 = selectedBox.x1;
				selectedBox.x1 = selectedBox.x2;
				selectedBox.x2 = previousX1;
			}
			if (selectedBox.y1 > selectedBox.y2) {
				var previousY1 = selectedBox.y1;
				selectedBox.y1 = selectedBox.y2;
				selectedBox.y2 = previousY1;
			}
		}
		dispatch({ type: "SET_DRAWING", isDrawing: false });
		dispatch({
			type: "SET_CLICKED_AREA",
			clickedArea: {
				box: -1,
				pos: "o",
			},
		});

		dispatch({ type: "SET_TMP_BOX", tmpBox: null });
	}

	function trackMousePos(e) {
		const main = document.getElementById("main");
		var mousePos = { x: e.clientX - main.offsetLeft, y: e.clientY - main.offsetTop };
		dispatch({ type: "SET_MOUSE", mouseX: mousePos.x, mouseY: mousePos.y });
	}
}
