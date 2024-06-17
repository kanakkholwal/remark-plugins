import { cn } from '@/lib/utils';
import { cva } from "class-variance-authority";
import { toString } from 'mdast-util-to-string';
import { Plugin, Transformer } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

interface ContainerDirective extends Node {
    type: 'containerDirective'
    name: string
    attributes: Record<string, string>
    children: Node[]
}

interface CalloutNode extends Node {
    type: string
    data: {
        hName: string
        hProperties: {
            className: string
        }
    }
    children: Node[]
}

const CALLOUT_TYPES = ['default', 'info', 'warning', 'success', 'danger'] as const

const calloutVariant = cva(
    "relative w-full rounded-lg border p-4 my-2 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                info:
                    "border-cyan/50 text-cyan dark:border-cyan [&>svg]:text-cyan",
                warning:
                    "border-yellow/50 text-yellow dark:border-yellow [&>svg]:text-yellow",
                success:
                    "border-green/50 text-green dark:border-green [&>svg]:text-green",
                danger:
                    "border-red/50 text-red dark:border-red [&>svg]:text-red",

            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

type CalloutType = (typeof CALLOUT_TYPES)[number]

interface CalloutOptions {
    directiveNames: readonly CalloutType[],
    title: string | null
    defaultDirective: CalloutType
    aliases: Record<string, string>
    icons: Record<CalloutType, string>
}

const DEFAULT_OPTIONS: CalloutOptions = {
    directiveNames: CALLOUT_TYPES,
    title: null,
    defaultDirective: 'default',
    aliases: {},
    icons: {
        default: '💡',
        info: 'ℹ️',
        warning: '⚠️',
        danger: '🚫',
        success: '✅',
    }
}

const createCallOutNode = (children: Node[], title: string, icon: string, className: string): CalloutNode => {
    const titleNode = {
        type: 'element',
        data: {
            hName: 'div',
            hProperties: {
                className: 'callout-title'
            }
        },
        children: [
            {
                type: 'text',
                value: icon,
                data: {
                    hName: 'span',
                    hProperties: {
                        className: 'mr-2 callout-icon'
                    }
                }
            },
            {
                type: 'text',
                value: title,
                data: {
                    hName: 'span',
                    hProperties: {
                        className: 'mb-1 font-medium leading-none tracking-tight callout-title-text'
                    }
                }
            },
        ]
    }

    const contentNode = {
        type: 'element',
        data: {
            hName: 'div',
            hProperties: {
                className: 'text-sm [&_p]:leading-relaxed callout-content'
            }
        },
        children: children.slice(1)
    }
    const newChildren = title ? [titleNode, contentNode] : [contentNode]

    return {
        type: 'element',
        data: {
            hName: 'div',
            hProperties: {
                className
            }
        },
        children: newChildren
    }
}

const remarkCallout: Plugin = () => {
    const settings = { ...DEFAULT_OPTIONS }

    const transformer: Transformer = (tree: Node) => {
        visit(tree, 'containerDirective', (node: ContainerDirective, index: number, parent: Node & { children: Node[] }) => {
            if (node.name !== 'callout') return;
        
            // if (node.children.length < 2) return console.error('Callout directive must have a title and content');
        
            const node_callout_type = toString((node.children[0] as Node & { value?: string })?.value || "default").trim().toLowerCase() as CalloutType;


            const variant: CalloutType = Array.from(CALLOUT_TYPES).includes(node_callout_type) ? node_callout_type as CalloutType : settings.defaultDirective;

            const icon = settings.icons[variant] || ''
            const title = node.attributes["title"] || "";

            const className = cn(calloutVariant({ variant  }), 'callout', `callout-${node_callout_type}`)

            const callOutNode = createCallOutNode(node.children, title, icon, className)
            parent.children.splice(index, 1, callOutNode)
        })
    }

    return transformer
}

export default remarkCallout