const localStorageData = localStorage.getItem("state");
const parsedState = localStorageData ? JSON.parse(localStorageData) : null;

const DEFAULT_STATE = {
	startX: 0,
	startY: 0,
	isDrawing: false,
	didMouseMove: false,
	clickedArea: { box: -1, pos: "o" },
	boxes: {},
	files: [],
	mouseX: 0,
	mouseY: 0,
	originalImageSize: { width: 0, height: 0 },
	currentFileIndex: 0,
	popup: false,
};

const INITIAL_STATE = parsedState
	? {
			...parsedState,
	  }
	: DEFAULT_STATE;

export default INITIAL_STATE;
