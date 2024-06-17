import { cn } from '@/lib/utils';
import { Plugin, Transformer } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

interface LeafDirective extends Node {
    type: 'leafDirective'
    name: string
    attributes: Record<string, string>
    children: Array<{ type: string; value: string }>
}



// Define types for the different HTML elements we'll be using
type DivElement = {
    type: 'element'
    tagName: 'div'
    properties?: { className?: string }
    children: Array< ImageElement | DivElement | HeadingElement | ParagraphElement | SpanElement>
}



type ImageElement = {
    type: 'element'
    tagName: 'img'
    properties: { src: string; alt: string }
}

type HeadingElement = {
    type: 'element'
    tagName: 'h3'
    children: Array<TextNode>
}

type ParagraphElement = {
    type: 'element'
    tagName: 'p'
    children: Array<TextNode>
}

type SpanElement = {
    type: 'element'
    tagName: 'span'
    children: Array<TextNode>
}

type TextNode = {
    type: 'text'
    value: string
}

// Define the main LinkPreviewNode type
interface LinkPreviewNode extends Node {
    type: 'linkPreview'
    data: {
        hName: 'a'
        hProperties: Record<string, string | number>
    }
    children: Array<ImageElement | DivElement>
}


interface LinkPreviewData {
    title: string
    description: string
    image: string
    domain: string
}

interface RemarkLinkPreviewOptions {
    className?: string
    excludeDomains?: string[]
}

const DEFAULT_OPTIONS: RemarkLinkPreviewOptions = {
    className: 'link-preview',
    excludeDomains: []
}
function fetchLinkPreview(url: string): LinkPreviewData {
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname
    const cleanDomain = domain.startsWith('www.') ? domain.slice(4) : domain
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1] || cleanDomain
    const title = lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return {
        title: title,
        description: `A link to ${cleanDomain}`,
        image: `https://icon.horse/icon/${cleanDomain}`,
        domain: cleanDomain,
    }
}

const createLinkPreviewNode = (url: string, previewData: LinkPreviewData, className: string): LinkPreviewNode => ({

    type: 'linkPreview',
    data: {
        hName: "a",
        hProperties: {
            href: url, 
            target: '_blank',
            rel: 'noopener noreferrer',
            className:cn("relative w-full flex rounded-lg border my-2 bg-background text-foreground no-underline","link-preview",className)

        }
    },
    children: [
        {
            type: 'element',
            tagName: 'img',
            properties: { src: previewData.image, alt: previewData.title }
        },
        {
            type: 'element',
            tagName: 'div',
            properties:{
                className:"flex flex-col p-4 gap-2 items-start"
            },
            children: [
                {
                    type: 'element',
                    tagName: 'h3',
                    children: [{ type: 'text', value: previewData.title }]
                },
                {
                    type: 'element',
                    tagName: 'p',
                    children: [{ type: 'text', value: previewData.domain }]
                }
            ]
        }
    ]
})

const remarkLinkPreview: Plugin = (options: RemarkLinkPreviewOptions = {}) => {
    const settings = { ...DEFAULT_OPTIONS, ...options }

    const transformer: Transformer = (tree: Node) => {


        visit(tree, 'leafDirective', (node: LeafDirective, index: number, parent: Node & { children: Node[] }) => {
            if (node.name !== 'link-preview') return;

            const url = node.attributes.url

            if (
                node.children.length === 0 &&
                !settings.excludeDomains?.some(domain => url.includes(domain))
            ) {

                const previewNode = createLinkPreviewNode(url, fetchLinkPreview(url), settings.className!)
                parent.children.splice(index, 1, previewNode)

            }
        })

    }

    return transformer
}

export default remarkLinkPreview