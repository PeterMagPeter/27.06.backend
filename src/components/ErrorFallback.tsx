import { useErrorBoundary } from "react-error-boundary";
import { Link } from "react-router-dom";

export function ErrorFallback({ error }: { error: Error }) {
    const {resetBoundary} = useErrorBoundary();

    return (
        <div>
            <Link to={`/`} onClick={resetBoundary}>Übersicht</Link>

            <h1><pre>Warning! unexpected error: </pre></h1>
            <pre>{error && error.message}</pre>
            <pre>{error && error.stack}</pre>
        </div>
    );
}
