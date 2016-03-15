import { connect } from 'react-redux'
import { menuItemOpen, textChanged, exportFile } from './EditActions.js';
import Map from './EditPage.jsx'

const mapStateToProps = (state) => {
    return {
        viewState: state.viewState
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onMenuItemOpen: (id) => {
            dispatch(menuItemOpen(id))
        },
        onTextChanged: (text) => {
            dispatch(textChanged(text))
        },
        onFileExport: (options, content) => {
            dispatch(exportFile(options, content))
        }
    }
};

const MapStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);

export default MapStateContainer;