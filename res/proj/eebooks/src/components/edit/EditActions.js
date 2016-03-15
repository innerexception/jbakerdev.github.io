//import Epub from 'epub-gen';
import Constants from '../Constants.js';

export const fetchViewState = (text) => {
    return {
        type: 'FETCH_VIEWSTATE',
        text
    }
};

export const menuItemOpen = (itemName) => {
    return {
        type: 'OPEN_MENU_ITEM',
        itemName
    }
};

export const textChanged = (text) => {
    return {
        type: 'TEXT_CHANGED',
        text
    }
};

export const fileExported = (success, error) => {
    return {
        type: 'FILE_EXPORTED',
        success,
        error
    }
};

export const exportFile = (options, exportPath) => {
    return {
        type: 'FILE_EXPORTED',
        success: true
    }
    //return (dispatch) => {
    //    new Epub(options, exportPath).then(
    //    (success) => {
    //        dispatch(fileExported(true))
    //    },
    //    (error) => {
    //        dispatch(fileExported(false, error))
    //    });
    //};
};