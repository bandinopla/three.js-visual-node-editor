# three.js TSL Visual Node Editor

## **[!] Work in progress | Alpha state** <br/>
Visual node editor, inspired by [Blender's shader editor](https://www.blender.org/), is a tool to visually build [Three.js](https://threejs.org/) materials using [Three.js-Shading-Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language). 

It is currently in development, and hoping to welcome developers from the comunity to jump in and add new nodes. Credit will be given to everyone!

# How does it work?
When you use the app: You create the nodes and the output will be a javascript file that will contain the nodes you created + the node setup in a comment, in case you want to edit the nodes after saving. In your real life project you will import the materials from this js, that will export an array of the materials. You will do something like...

```js
import { materials } from "./your-saved-file.js";
const material1 = materials[0]; //<-- this is a THREE.Material 
```

# How to collaborate?
I did a few basic nodes, I think the skeleton is setup to allow for easy addition of new nodes, the ideal is for "you" to add new nodes or even improve the current ones. To do so, you must check the [Three.js-Shading-Language Docs](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)

You can also fix bugs or improve the code/interface. Just clone and do a pull request.

# == Nodes "done"... ==
These are the nodes currently "done" (room for improvement)...
- UV Channel
- Scene Preview
- (incomplete) MeshStandardNode shader node. ( only colorNode property )
- Image texture node

------
------
------

# Design / How it works...
## Concepts / Building blocks
- **Node** : they live in `src/nodes` they are the objects in charge of defining a node and whatever that node does. A Node is not a 1:1 recreation of a TSL node, a node can do a bunch of things, even use many nodes at the same time and build complex structures in TSL. 
- **Property** : Nodes are a bag filled with properties. They live in `src/properties` and each property is in charge of one aspect of the node.
- **Outlet**: the input or output socket of a node. A node can have many of both. An outlet is a property that handles the connection between the outside and the node.
- **Component**: The most basic UI unit. A button, a TextLabel, etc...
- **Script**: Since this exports a javascript, a `src/export/Script` object is created the moment of the export and each node will be asked to "write" on this script whatever it needs to function. Then this script is covnerted to a string and downloaded as the .js file. The layout info is stored in this file as a comment.
- **ThreeScene**: object in charge of the preview scene running in the background that allows us to see how the material will look. 

## Theme / colors / styles
The app is "skinned" using the theme provided by `src/colors/Theme`. A singleton class that provides the settings for the styles. 

## The Script
Nodes in this app export to a javascript file. This object is in charge of handling how that file is written.

A `Script` is an object that serves as a scope for every node when writing their scripts. "Writing their scripts" means basically writing the actual javascript TSL code that the node represents.

The process is first triggered by the `src/Editor.ts:save()` that creates this object and then asks every node to `.writeScript( script )` to it. This process will generate a domino effect that will "travel" from the node, then it will to the connected nodes vía the input outlets that connect the node to the next node, and so on... until there's no more nodes with connections.

For more info ask me here or via x @bandinopla...