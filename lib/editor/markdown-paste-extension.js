import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { MarkdownParser } from 'prosemirror-markdown'
import MarkdownIt from 'markdown-it'

/**
 * Extension to parse markdown on paste
 * Converts pasted markdown text into rich text formatting
 */
export const MarkdownPaste = Extension.create({
    name: 'markdownPaste',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('markdownPaste'),
                props: {
                    handlePaste: (view, event, slice) => {
                        // Only handle plain text paste
                        const text = event.clipboardData?.getData('text/plain')
                        if (!text) return false

                        // Don't process if pasting HTML (rich text)
                        const html = event.clipboardData?.getData('text/html')
                        if (html) return false

                        // Check if the text looks like markdown
                        // Look for common markdown patterns
                        const hasMarkdownSyntax = /^#{1,6}\s|^\*\s|^-\s|^\d+\.\s|^\[.+\]\(.+\)|^\*\*.+\*\*|^_.+_|^`{1,3}|^>\s/m.test(text)

                        if (!hasMarkdownSyntax) return false

                        // Prevent default paste
                        event.preventDefault()

                        try {
                            // Create markdown parser
                            const md = new MarkdownIt()
                            const parser = new MarkdownParser(view.state.schema, md, {
                                blockquote: { block: 'blockquote' },
                                paragraph: { block: 'paragraph' },
                                list_item: { block: 'listItem' },
                                bullet_list: { block: 'bulletList' },
                                ordered_list: { block: 'orderedList', getAttrs: tok => ({ order: +tok.attrGet('start') || 1 }) },
                                heading: { block: 'heading', getAttrs: tok => ({ level: +tok.tag.slice(1) }) },
                                code_block: { block: 'codeBlock', noCloseToken: true },
                                fence: { block: 'codeBlock', getAttrs: tok => ({ language: tok.info || null }), noCloseToken: true },
                                hr: { node: 'horizontalRule' },
                                image: { node: 'image', getAttrs: tok => ({ src: tok.attrGet('src'), alt: tok.children?.[0]?.content || null }) },
                                hardbreak: { node: 'hardBreak' },

                                em: { mark: 'italic' },
                                strong: { mark: 'bold' },
                                link: { mark: 'link', getAttrs: tok => ({ href: tok.attrGet('href'), target: null }) },
                                code_inline: { mark: 'code', noCloseToken: true },
                            })

                            // Parse markdown to ProseMirror document
                            const doc = parser.parse(text)

                            if (!doc) return false

                            // Insert the parsed content
                            const { tr } = view.state
                            const { from, to } = view.state.selection
                            tr.replaceWith(from, to, doc.content)
                            view.dispatch(tr)

                            return true
                        } catch (error) {
                            console.error('Error parsing markdown:', error)
                            return false
                        }
                    }
                }
            })
        ]
    }
})
