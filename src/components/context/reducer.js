const Reducer = (state, action) => {
	switch (action.type) {
		case "INIT_BOXES":
			const obj = {};
			for (let i = 0; i < action.length; i++) {
				obj[i] = [];
			}
			return {
				...state,
				boxes: obj,
			};
		case "SET_MOUSE":
			return {
				...state,
				mouseX: action.mouseX,
				mouseY: action.mouseY,
			};
		case "SET_POPUP":
			return {
				...state,
				popup: action.popup,
			};
		case "SET_START":
			return {
				...state,
				startX: action.startX,
				startY: action.startY,
			};
		case "SET_FILES":
			return {
				...state,
				files: action.files,
			};
		case "SET_CLICKED_AREA":
			return {
				...state,
				clickedArea: action.clickedArea,
			};
		case "SET_CURRENT_FILE_INDEX":
			return {
				...state,
				currentFileIndex: 0,
			};
		case "ADD_BOX":
			const b = state.boxes[action.index];
			let c = JSON.stringify(b).indexOf(JSON.stringify(action.box));

			console.log(c);
			if (c === -1) {
				console.log("yes there is");
				b.push(action.box);
			}

			console.log(b);
			return {
				...state,
				boxes: { ...state.boxes, currentFileIndex: b },
			};
		case "POP_BOX":
			const temp_arr = state.boxes[action.index];
			if (temp_arr.length > 0) {
				temp_arr.pop();
			}
			return {
				...state,
				boxes: [...state.boxes, temp_arr],
			};
		case "SET_DRAWING":
			return {
				...state,
				isDrawing: action.isDrawing,
			};
		case "SET_MOUSEMOVE":
			return {
				...state,
				didMouseMove: action.didMouseMove,
			};
		case "SET_IMAGE_SIZE":
			return {
				...state,
				originalImageSize: action.size,
			};
		case "NEXT_FILE":
			return {
				...state,
				currentFileIndex:
					state.currentFileIndex < state.files.length - 1
						? state.currentFileIndex + 1
						: state.currentFileIndex,
			};
		case "PREV_FILE":
			return {
				...state,
				currentFileIndex:
					state.currentFileIndex > 0 ? state.currentFileIndex - 1 : state.currentFileIndex,
			};
		case "CHANGE_FILE":
			const arr = state.files;
			arr[action.index] = [state.files[action.index][0], action.file];
			return {
				...state,
				files: arr,
			};
		default:
			return state;
	}
};

export default Reducer;
