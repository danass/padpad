export default function EditorSkeleton({ placeholderTitle = 'Title', placeholderText = 'Tell your story...', className = '' }) {
    return (
        <div className={`prose max-w-none min-h-[300px] p-4 md:p-0 relative font-['DM_Sans',sans-serif] ${className}`}>
            {/* Mocking TipTap structure for LCP */}
            <div className="ProseMirror">
                <h1 className="text-gray-300 pointer-events-none mb-4">{placeholderTitle}</h1>
                <p className="text-gray-400 opacity-60 pointer-events-none">{placeholderText}</p>
            </div>
        </div>
    )
}
