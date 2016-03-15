const editPageReducer = (state = {}, action) => {
    let vs = state.viewState;
    switch (action.type) {
        case 'FETCH_VIEWSTATE':
            return { ...state, viewState: { text: action.text }};
        case 'OPEN_MENU_ITEM':
            if(state.viewState.openMenuName === action.itemName)
            return { ...state, viewState: {...vs, openMenuName: null} };
            else return { ...state, viewState: {...vs, openMenuName: action.itemName} };
        case 'TEXT_CHANGED':
            return { ...state, viewState: {...vs, text: action.text} };
        case 'EXPORT_FILE':
            return { ...state, viewState: {...vs, exported: action.success } };
        default:
            return state
    }
};


export default editPageReducer;