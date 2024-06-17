import { cn } from '@/lib/utils'
import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { visit } from 'unist-util-visit'

interface EmbedNode extends Node {
    type: string
    data: {
        hName: string
        hProperties: {
            src: string
            width: string
            height: string
            frameBorder: string
            allow: string
            allowFullScreen: boolean
            className: string
        }
    }
}

interface LeafDirectiveNode extends Node {
    type: 'leafDirective'
    name: string
    attributes: Record<string, string>
    children: Array<{ type: string; value: string }>
}

interface EmbedConfig {
    type: string
    getSrc: (id: string) => string
    defaultClassName: string
}

const defaultEmbedConfigs: Record<string, EmbedConfig> = {
    youtube: {
        type: 'embed_youtube',
        getSrc: (id) => `https://www.youtube.com/embed/${id}`,
        defaultClassName: 'embed embed-youtube'
    },
    vimeo: {
        type: 'embed_vimeo',
        getSrc: (id) => `https://player.vimeo.com/video/${id}`,
        defaultClassName: 'embed embed-vimeo'
    },
    iframe:{
        type: 'embed_iframe',
        getSrc: (id) => id,
        defaultClassName: 'embed embed-iframe'
    }
}
interface RemarkEmbedOptions {
    customConfigs?: Record<string, EmbedConfig>
}

const createEmbedNode = (config: EmbedConfig, id: string, classNames: string): EmbedNode => ({
    type: config.type,
    data: {
        hName: 'iframe',
        hProperties: {
            src: config.getSrc(id),
            width: '100%',
            height: '480px',
            frameBorder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
            className: cn("w-full h-full rounded-lg aspect-video my-2", config.defaultClassName, classNames)
        }
    }
})

const remarkEmbed: Plugin = (options: RemarkEmbedOptions = {}) => {
    const embedConfigs = { ...defaultEmbedConfigs, ...options.customConfigs }

    const transformer: Transformer = (tree: Node) => {
        visit(tree, 'leafDirective', (node: LeafDirectiveNode, index: number, parent: Node & { children: Node[] }) => {
            if (node.children.length !== 1 || node?.children[0]?.type !== 'text') {
                return
            }
            if (node.name === 'embed') {
                const embedType = node.children[0].value.trim()
                const config = embedConfigs[embedType]

                if (!config) return

                const id = node.attributes["id"]!.trim()
                const classNames = node.attributes?.["class"] || ""

                const embedNode = createEmbedNode(config, id, classNames)

                parent.children.splice(index, 1, embedNode)
            }
        })
    }
    return transformer
}

export default remarkEmbed