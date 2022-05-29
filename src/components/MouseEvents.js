import Utils from "./Utils";

export default class MouseEvents {
	constructor(state, dispatch) {
		this.state = state;
		this.dispatch = dispatch;
		this.utils = new Utils(state, dispatch);
	}
}
