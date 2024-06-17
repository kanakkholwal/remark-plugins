# remark-plugins

A collection of remark plugins for markdown processing.

## Installation

```bash
npm install remark-plugins 
# or
yarn add remark-plugins
# or 
bun install remark-plugins
# or
pnpm install remark-plugins
```
> Note : These plugins requires `remark-directive` package to run so make sure to install that and call just before remark-plugins.
> ```js
> import remarkDirective from 'remark-directive';
> ```
## Plugins

### 1. Callout Plugin

#### Description

Transforms custom callout blocks in markdown into styled callouts.

#### Usage

```js
import remarkCallout from 'remark-plugins/callout';
// or 
import {remarkCallout} from 'remark-plugins';

 <ReactMarkdown  remarkPlugins={[remarkDirective,remarkCallout]} >
{markdown}
</ReactMarkdown>
```

#### Markdown Syntax

```md
::callout[warn]{title=Warning}
This is a custom note content.
:::
```

### 2. Embed Plugin

#### Description

Transforms custom embed blocks in markdown into iframe embeds for YouTube, Vimeo, and other platforms.

#### Usage

```js
import remarkEmbedfrom 'remark-plugins/embed';
// or 
import {remarkEmbed} from 'remark-plugins';

 <ReactMarkdown  remarkPlugins={[ remarkDirective,remarkEmbed]} >
{markdown}
</ReactMarkdown>
```

#### Markdown Syntax

```md
::embed[youtube]{id=yaodD79Q4iE .some-class}
# or
::embed[iframe]{id=http://google.com .some-class}

```

### 3. Slugify Headings Plugin

#### Description

Automatically generates slugified IDs for headings in markdown.

#### Usage

```js
import slugifyHeading from 'remark-plugins/slugify-heading';
// or 
import {slugifyHeading} from 'remark-plugins';


<ReactMarkdown remarkPlugins={[remarkDirective, slugifyHeading]} >
{markdown}
</ReactMarkdown>
```

#### Markdown Syntax

```md
# My Heading

This heading will have an ID of `my-heading`.

```
