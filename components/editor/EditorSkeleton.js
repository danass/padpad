export default function EditorSkeleton({ className = '' }) {
    return (
        <div className={`prose max-w-none min-h-[300px] p-4 md:p-0 relative ${className}`}>
            <div className="ProseMirror animate-pulse">
                {/* Mocking H1 */}
                <div className="h-10 w-1/3 bg-gray-100 rounded-lg mb-8" />
                {/* Mocking Paragraphs */}
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-50 rounded" />
                    <div className="h-4 w-full bg-gray-50 rounded" />
                    <div className="h-4 w-2/3 bg-gray-50 rounded" />
                </div>
            </div>
        </div>
    )
}
