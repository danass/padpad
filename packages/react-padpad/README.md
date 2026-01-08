# react-padpad

Embeddable React component for displaying Padpad posts and user archives on external websites.

## Installation

```bash
npm install react-padpad
```

## Usage

### Display a Single Post

```jsx
import { Padpad } from 'react-padpad'

function MyComponent() {
  return <Padpad id="09fcacc2-f3a8-48f5-a52d-f6bbd0efd292" />
}
```

### Display a User Archive

```jsx
import { Padpad } from 'react-padpad'

function MyComponent() {
  return <Padpad handle="hello" />
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | No* | Document ID to display a single post |
| `handle` | string | No* | Username to display user's archive |
| `theme` | 'light' \| 'dark' | No | Theme for the embedded content (default: 'light') |
| `maxHeight` | string | No | Maximum height with CSS unit (default: '600px') |
| `showMeta` | boolean | No | Show author and date metadata (default: true) |

*Either `id` or `handle` must be provided

## Example

```jsx
<Padpad 
  id="09fcacc2-f3a8-48f5-a52d-f6bbd0efd292"
  theme="dark"
  maxHeight="800px"
  showMeta={true}
/>
```

## License

MIT
