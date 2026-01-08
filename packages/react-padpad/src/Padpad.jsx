import React, { useState, useEffect } from 'react'
import './styles/embed.css'

export function Padpad({ id, handle, theme = 'light', maxHeight = '600px', showMeta = true }) {
    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true)
            setError(null)

            try {
                let url
                if (id) {
                    // Fetch single post
                    url = `https://www.textpad.cloud/api/public/documents/${id}`
                } else if (handle) {
                    // Fetch user archive
                    url = `https://www.textpad.cloud/api/public/archive/${handle}`
                } else {
                    throw new Error('Either id or handle must be provided')
                }

                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`)
                }

                const data = await response.json()
                setContent(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchContent()
    }, [id, handle])

    if (loading) {
        return (
            <div className={`padpad-embed padpad-theme-${theme}`} style={{ maxHeight }}>
                <div className="padpad-loading">Loading...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`padpad-embed padpad-theme-${theme}`} style={{ maxHeight }}>
                <div className="padpad-error">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className={`padpad-embed padpad-theme-${theme}`} style={{ maxHeight }}>
            {id ? (
                <PostEmbed content={content} showMeta={showMeta} />
            ) : (
                <ArchiveEmbed content={content} handle={handle} />
            )}
        </div>
    )
}

function PostEmbed({ content, showMeta }) {
    const { document, snapshot } = content || {}

    if (!snapshot?.content_json) {
        return <div className="padpad-error">No content available</div>
    }

    return (
        <div className="padpad-post">
            {showMeta && (
                <div className="padpad-meta">
                    {document?.title && <h2 className="padpad-title">{document.title}</h2>}
                    <div className="padpad-meta-info">
                        {document?.updated_at && (
                            <span className="padpad-date">
                                {new Date(document.updated_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <div className="padpad-content">
                <TiptapRenderer content={snapshot.content_json} />
            </div>
        </div>
    )
}

function ArchiveEmbed({ content, handle }) {
    const { documents } = content || {}

    if (!documents || documents.length === 0) {
        return <div className="padpad-empty">No public posts found</div>
    }

    return (
        <div className="padpad-archive">
            <h2 className="padpad-archive-title">Posts by {handle}</h2>
            <div className="padpad-post-list">
                {documents.map((doc) => (
                    <a
                        key={doc.id}
                        href={`https://www.textpad.cloud/public/doc/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="padpad-post-item"
                    >
                        <h3>{doc.title || 'Untitled'}</h3>
                        {doc.updated_at && (
                            <span className="padpad-date">
                                {new Date(doc.updated_at).toLocaleDateString()}
                            </span>
                        )}
                    </a>
                ))}
            </div>
        </div>
    )
}

// Simple TipTap content renderer
function TiptapRenderer({ content }) {
    if (!content || !content.content) {
        return null
    }

    const renderNode = (node, index) => {
        switch (node.type) {
            case 'paragraph':
                return (
                    <p key={index}>
                        {node.content?.map((child, i) => renderNode(child, i))}
                    </p>
                )
            case 'heading':
                const HeadingTag = `h${node.attrs?.level || 2}`
                return (
                    <HeadingTag key={index}>
                        {node.content?.map((child, i) => renderNode(child, i))}
                    </HeadingTag>
                )
            case 'text':
                let text = <span key={index}>{node.text}</span>
                if (node.marks) {
                    node.marks.forEach((mark) => {
                        switch (mark.type) {
                            case 'bold':
                                text = <strong key={index}>{text}</strong>
                                break
                            case 'italic':
                                text = <em key={index}>{text}</em>
                                break
                            case 'link':
                                text = (
                                    <a
                                        key={index}
                                        href={mark.attrs.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {text}
                                    </a>
                                )
                                break
                        }
                    })
                }
                return text
            case 'bulletList':
                return (
                    <ul key={index}>
                        {node.content?.map((child, i) => renderNode(child, i))}
                    </ul>
                )
            case 'orderedList':
                return (
                    <ol key={index}>
                        {node.content?.map((child, i) => renderNode(child, i))}
                    </ol>
                )
            case 'listItem':
                return (
                    <li key={index}>
                        {node.content?.map((child, i) => renderNode(child, i))}
                    </li>
                )
            case 'codeBlock':
                return (
                    <pre key={index}>
                        <code>{node.content?.map((child) => child.text).join('')}</code>
                    </pre>
                )
            case 'blockquote':
                return (
                    <blockquote key={index}>
                        {node.content?.map((child, i) => renderNode(child, i))}
                    </blockquote>
                )
            case 'image':
            case 'resizableImage':
                return (
                    <img
                        key={index}
                        src={node.attrs?.src}
                        alt={node.attrs?.alt || ''}
                        style={{ maxWidth: '100%' }}
                    />
                )
            case 'hardBreak':
                return <br key={index} />
            default:
                return null
        }
    }

    return (
        <div className="tiptap-content">
            {content.content.map((node, index) => renderNode(node, index))}
        </div>
    )
}
