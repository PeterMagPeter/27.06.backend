"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorFallback = ErrorFallback;
const react_error_boundary_1 = require("react-error-boundary");
const react_router_dom_1 = require("react-router-dom");
function ErrorFallback({ error }) {
    const { resetBoundary } = (0, react_error_boundary_1.useErrorBoundary)();
    return (<div>
            <react_router_dom_1.Link to={`/`} onClick={resetBoundary}>Übersicht</react_router_dom_1.Link>

            <h1><pre>Warning! unexpected error: </pre></h1>
            <pre>{error && error.message}</pre>
            <pre>{error && error.stack}</pre>
        </div>);
}
//# sourceMappingURL=ErrorFallback.js.map