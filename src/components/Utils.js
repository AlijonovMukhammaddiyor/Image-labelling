import JSZip from "jszip";

export default class Utils {
	constructor(state, dispatch) {
		this.state = state;
		this.dispatch = dispatch;
		this.lineOffset = 4;
		this.anchrSize = 4;
	}

	download(e) {
		var link = document.createElement("a");
		link.download = this.state.files[this.state.currentFileIndex][0];
		link.href = document.getElementById("canvas").toDataURL();
		link.click();
	}

	dataURLtoBlob(dataurl) {
		var arr = dataurl.split(","),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], { type: mime });
	}

	downloadTextFile(e) {
		// const temp = ["startX", "startY", "endX", "endY", "label"];
		const temp = {};
		for (let i = 0; i < this.state.files.length; i++) {
			temp[this.state.files[i][0]] = [];
			const boxes = this.state.boxes[i];
			for (let box of boxes) {
				temp[this.state.files[i][0]].push({
					startX: box.x1,
					startY: box.y1,
					endX: box.x2,
					endY: box.y2,
					label: box.label,
				});
			}
		}

		const element = document.createElement("a");
		const file = new Blob([JSON.stringify(temp)], { type: "application/json" });
		element.href = URL.createObjectURL(file);
		element.download = "details.json";
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
	}

	getCanvasAndCtx() {
		const canvas = document.getElementById("canvas");
		const ctx = canvas.getContext("2d");

		return { canvas, ctx };
	}

	coverImg(img, type) {
		const { canvas, ctx } = this.getCanvasAndCtx();
		ctx.globalCompositeOperation = "destination-over";
		const imgRatio = img.height / img.width;
		const winRatio = canvas.height / canvas.width;

		if ((imgRatio < winRatio && type === "contain") || (imgRatio > winRatio && type === "cover")) {
			const h = canvas.width * imgRatio;
			ctx.globalCompositeOperation = "destination-over";
			ctx.drawImage(img, 0, (canvas.height - h) / 2, canvas.width, h);
		}

		if ((imgRatio > winRatio && type === "contain") || (imgRatio < winRatio && type === "cover")) {
			const w = (canvas.width * winRatio) / imgRatio;
			ctx.globalCompositeOperation = "destination-over";
			ctx.drawImage(img, (canvas.width - w) / 2, 0, w, canvas.height);
		}
	}

	handleUpload(files) {
		function processFilename(p) {
			let names = p.split("/");
			let name = names.pop();
			if (name.slice(0, 2) === "._") {
				name = name.slice(2);
			}
			return name;
		}

		let promise = JSZip.loadAsync(files[0]).then(function (zip) {
			const re = /(.jpg|.png|.gif|.ps|.jpeg|.webp)$/;

			const names = [];

			const promises = Object.keys(zip.files)
				.filter(function (fileName) {
					const name = processFilename(fileName);
					if (names.includes(name)) {
						return false;
					}
					names.push(name);
					return re.test(fileName.toLowerCase());
				})
				.map(function (fileName) {
					const file = zip.files[fileName];
					return file.async("blob").then(function (blob) {
						let names = fileName.split("/");
						let name = names.pop();
						if (name.slice(0, 2) === "._") {
							name = name.slice(2);
						}
						// console.log(name);
						return [name, URL.createObjectURL(blob)];
					});
				});

			return Promise.all(promises);
		});

		promise.then((data) => {
			const length = data.length;
			this.dispatch({ type: "INIT_BOXES", length });
			this.dispatch({ type: "SET_LABELPROMPT", label: true });
			this.dispatch({ type: "SET_FILES", files: data });
			this.dispatch({ type: "SET_CURRENT_FILE_INDEX", index: 0 });
		});
	}

	findCurrentArea(x, y) {
		const boxes = this.state.boxes[this.state.currentFileIndex];
		for (var i = 0; i < boxes.length; i++) {
			var box = boxes[i];
			let xCenter = box.x1 + (box.x2 - box.x1) / 2;
			let yCenter = box.y1 + (box.y2 - box.y1) / 2;
			if (box.x1 - this.lineOffset < x && x < box.x1 + this.lineOffset) {
				if (box.y1 - this.lineOffset < y && y < box.y1 + this.lineOffset) {
					return { box: i, pos: "tl" };
				} else if (box.y2 - this.lineOffset < y && y < box.y2 + this.lineOffset) {
					return { box: i, pos: "bl" };
				} else if (yCenter - this.lineOffset < y && y < yCenter + this.lineOffset) {
					return { box: i, pos: "l" };
				}
			} else if (box.x2 - this.lineOffset < x && x < box.x2 + this.lineOffset) {
				if (box.y1 - this.lineOffset < y && y < box.y1 + this.lineOffset) {
					return { box: i, pos: "tr" };
				} else if (box.y2 - this.lineOffset < y && y < box.y2 + this.lineOffset) {
					return { box: i, pos: "br" };
				} else if (yCenter - this.lineOffset < y && y < yCenter + this.lineOffset) {
					return { box: i, pos: "r" };
				}
			} else if (xCenter - this.lineOffset < x && x < xCenter + this.lineOffset) {
				if (box.y1 - this.lineOffset < y && y < box.y1 + this.lineOffset) {
					return { box: i, pos: "t" };
				} else if (box.y2 - this.lineOffset < y && y < box.y2 + this.lineOffset) {
					return { box: i, pos: "b" };
				} else if (box.y1 - this.lineOffset < y && y < box.y2 + this.lineOffset) {
					return { box: i, pos: "i" };
				}
			} else if (box.x1 - this.lineOffset < x && x < box.x2 + this.lineOffset) {
				if (box.y1 - this.lineOffset < y && y < box.y2 + this.lineOffset) {
					return { box: i, pos: "i" };
				}
			}
		}
		return { box: -1, pos: "o" };
	}

	setBackground() {
		if (this.state.files.length > 0) {
			const ctx = document.getElementById("canvas").getContext("2d");
			const canvas = document.getElementById("canvas");

			const img = new Image();
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			img.src = this.state.files[this.state.currentFileIndex][1];

			img.onload = () => {
				ctx.save();

				if (img.height > canvas.height || img.width > canvas.width) {
					this.coverImg(img, "contain");
				} else {
					ctx.globalCompositeOperation = "destination-over";
					ctx.drawImage(img, 0, 0);
				}
				ctx.restore();
			};
			img.onerror = (err) => {
				console.log("img error");
				console.error(err);
			};
		}
	}

	redraw() {
		// canvas.width = canvas.width;
		const boxes = this.state.boxes[this.state.currentFileIndex];
		const { ctx } = this.getCanvasAndCtx();

		ctx.beginPath();
		for (var i = 0; i < boxes.length; i++) {
			this.drawBoxOn(boxes[i]);
		}

		if (this.state.clickedArea.box === -1) {
			const tmpBox = this.newBox(
				this.state.startX,
				this.state.startY,
				this.state.mouseX,
				this.state.mouseY
			);

			this.dispatch({ type: "SET_TMP_BOX", tmpBox });
			if (tmpBox != null) {
				this.drawBoxOn(tmpBox);
			}
		}
	}

	drawBoxOn(box) {
		const { canvas, ctx } = this.getCanvasAndCtx();
		const xCenter = box.x1 + (box.x2 - box.x1) / 2;
		const yCenter = box.y1 + (box.y2 - box.y1) / 2;
		ctx.beginPath();
		console.log(box.color);
		ctx.fillStyle = box.color;
		ctx.strokeStyle = box.color;
		ctx.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
		ctx.lineWidth = box.lineWidth;
		ctx.stroke();

		ctx.fillRect(
			box.x1 - this.anchrSize,
			box.y1 - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			box.x1 - this.anchrSize,
			yCenter - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			box.x1 - this.anchrSize,
			box.y2 - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			xCenter - this.anchrSize,
			box.y1 - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			xCenter - this.anchrSize,
			yCenter - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			xCenter - this.anchrSize,
			box.y2 - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			box.x2 - this.anchrSize,
			box.y1 - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			box.x2 - this.anchrSize,
			yCenter - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);

		ctx.fillRect(
			box.x2 - this.anchrSize,
			box.y2 - this.anchrSize,
			2 * this.anchrSize,
			2 * this.anchrSize
		);
		ctx.stroke();
	}

	newBox(x1, y1, x2, y2) {
		const boxX1 = x1 < x2 ? x1 : x2;
		const boxY1 = y1 < y2 ? y1 : y2;
		const boxX2 = x1 > x2 ? x1 : x2;
		const boxY2 = y1 > y2 ? y1 : y2;
		if (boxX2 - boxX1 > this.lineOffset * 2 && boxY2 - boxY1 > this.lineOffset * 2) {
			return {
				x1: boxX1,
				y1: boxY1,
				x2: boxX2,
				y2: boxY2,
				lineWidth: 2,
				color: "Black",
				label: null,
			};
		} else {
			return null;
		}
	}

	zoomInOut(zoomIn) {
		const { canvas, ctx } = this.utils.getCanvasAndCtx();
		if (zoomIn) {
			ctx.scale(2, 2);
		} else {
			ctx.scale(0.5, 0.5);
		}
	}

	undo(p) {
		const temp = this.state.boxes;
		if (temp.length >= 0 && this.state.files.length > 0) {
			const { canvas, ctx } = this.utils.getCanvasAndCtx();

			const img = new Image();
			img.src = this.state.files[this.state.currentFileIndex][1];

			img.onload = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				if (img.height > canvas.height || img.width > canvas.width) {
					this.coverImg(img, "contain");
				} else {
					ctx.globalCompositeOperation = "destination-over";
					ctx.drawImage(img, 0, 0);
				}

				ctx.restore();
				ctx.beginPath();

				ctx.stroke();
				this.redraw();
			};
			img.onerror = (err) => {
				console.log("img error");
				console.error(err);
			};
		}
	}

	reRender() {
		if (this.state.files.length > 0) {
			const { canvas, ctx } = this.getCanvasAndCtx();

			const img = new Image();
			img.src = this.state.files[this.state.currentFileIndex][1];

			img.onload = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				if (img.height > canvas.height || img.width > canvas.width) {
					this.coverImg(img, "contain");
				} else {
					ctx.globalCompositeOperation = "destination-over";
					ctx.drawImage(img, 0, 0);
				}

				ctx.restore();
				ctx.beginPath();

				ctx.stroke();
				const boxes = this.state.boxes[this.state.currentFileIndex];
				ctx.beginPath();
				for (var i = 0; i < boxes.length; i++) {
					this.drawBoxOn(boxes[i]);
				}
			};
			img.onerror = (err) => {
				console.log("img error");
				console.error(err);
			};
		}
	}

	setPopup(p) {
		this.popup = p;
	}

	getPopup() {
		return this.popup;
	}
}
