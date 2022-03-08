Infragram
======

The Infragram project brings together a range of different efforts to make Do-It-Yourself plant health comparisons possible with infrared photography.

This project is a minimal core of the Infragram project in JavaScript and was made possible with support from Google and the AREN Project at NASA.

Check it here: https://publiclab.github.io/infragram/

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/publiclab/infragram)

This is ported out of the Node server application at https://github.com/p-v-o-s/infragram-js

Read more at https://publiclab.org/infragram

## Quick Installation
1. Fork our repo from https://github.com/publiclab/infragram.
2. In the console, download a copy of your forked repo with `git clone https://github.com/your_username/infragram` where `your_username` is your GitHub username.
3. Enter the new infagram directory with `cd infragram`.
4. `npm install` - this will install all the node packages into your local machine.
5. `npm install http-server -g && http-server` (this installs http-server globally and then runs it, next time you just need to do `http-server` to run it locally)

## Contributing

We welcome contributions, and are especially interested in welcoming [first time contributors](#first-time). Read more about [how to contribute](#developers) below! We especially welcome contributions from people belonging to groups under-represented in free and open source software!

### Code of Conduct

Please read and abide by our [Code of Conduct](https://publiclab.org/conduct); our community aspires to be a respectful place both during online and in-­person interactions.


## Purpose

The purpose of this software is to convert a photo taken from an "Infragram" multispectral camera using NDVI or another technique, then to colorize that image. It can then be downloaded or forwarded to another web app.


## Architecture

This edition of Infragram is slimmed down and simplified vs. previous versions. The whole project runs using just JavaScript (and WebGL) from a single index.html file, in the browser. 

The basic flow is as shown here:

`Input` => `Convert` => `Colorize` => `Output`

1. Input: an image or video stream is chosen. 
2. Convert: The image gets modified/transformed using a given algorithm, like NDVI or another simple mathematic expression. This is handled by the processor (see below)
3. Colorize: It gets colorized (optionally), which is also handled by the processor (see below).
4. Output: the image can be downloaded or sent to another website.


## Inputs

Images can come from two sources: files or webcam video. 

### File upload

Handling for "uploaded" files (note that we don't actually send files anywhere, they're just used in the browser) is handled in [/src/ui/interface.js](https://github.com/publiclab/infragram/blob/80f3de4ddd96c2d5b452462d74076eab73ea0376/src/ui/interface.js#L75-L79).

Depending on which processor is selected (see below), the image is read, then sent to the `updateImage()` function of either the `webgl` (default) or `javascript` processor for conversion.

### Video

If the user presses the Webcam button, we use the WebRTC webcam API to stream video from the selected webcam, and we perform conversion and colorizing on each frame in real-time. This works faster with `webgl` mode.


## Processors

Two separate systems are available for converting and colorizing: `javascript` and `webgl`, both using the [HTML Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The [javascript](https://github.com/publiclab/infragram/blob/main/src/processors/javascript.js) processor is simpler to read, write, and debug, but is slower. The [webgl](https://github.com/publiclab/infragram/blob/main/src/processors/webgl.js) processor is MUCH faster, but very hard to code/modify/change.

### Colorizing

The processors also handle colorizing, which is also confusing because the `webgl` colorizer has to work very differently than the `javascript` version. 

Colorizing is just converting a black and white (monochrome) image to a color one, where a given spectrum or "color map" is used to convert each pixel's brightness value to a color. The most familiar would be where "hot" colors like red represent higher values, and "cold" colors like blue represent lower values.

This gets a little more complex because the most common conversion, NDVI, outputs a value from -1 to 1, rather than 0 to 1. So the color mapping may represent values in that range.

The way NDVI works also means that it's useful to visually see what pixels are greater or less than 0, so some color maps are not smooth - they have a sharp color transition at 0, so you can visually see parts of the photo that are >0. 


## Outputs

Once the image is converted and (optionally) colorized, it can be downloaded. But there are two other options:

### Export to PublicLab.org

The image is encoded as a data-url and a new tab is opened with the Public Lab Editor at https://publiclab.org/post, with the image "sent" to become the  main image. This is convoluted but easier than sending the image separately; see the [code for this here](https://github.com/publiclab/infragram/blob/34d330001e3869da9caf34cb79d6dc7650c1db83/index.html#L235-L248)

### Export to Image Sequencer

Similarly, we can "send" the image to https://sequencer.publiclab.org, as a data-url although it may fail for very large images since we must [send it in a GET request](https://github.com/publiclab/infragram/blob/34d330001e3869da9caf34cb79d6dc7650c1db83/index.html#L250-L254). It is then ru through a similar (but not identical, unfortunately) set of steps of conversion and colorizing, in the step-by-step interface of Image Sequencer, for fine-tuning.

## Interface

The interface (UI design) for Infragram is built using Bootstrap 3, and makes use of jQuery event handling. Most of the code can be found in https://github.com/publiclab/infragram/tree/main/src/ui although some listeners are still mixed into the rest of the code.


## Legacy code

Previous versions of Infragram had different workflows, technologies, and architectures. Some code remains which is no longer used.

See the deprecation label for more on this code: https://github.com/publiclab/infragram/labels/deprecation


## Developers

Help improve Public Lab software!

* Join the chatroom at https://publiclab.org/chat
* Look for open issues at https://github.com/publiclab/infragram/labels/help-wanted
* We're specifically asking for help with issues labelled with the https://github.com/publiclab/infragram/labels/help%20wanted tag
* Find lots of info on contributing at http://publiclab.org/developers
* Review specific contributor guidelines at http://publiclab.org/contributing-to-public-lab-software

## First Time?

New to open source/free software? Here is a selection of issues we've made **especially for first-timers**. We're here to help, so just ask if one looks interesting : https://code.publiclab.org

[Here](https://publiclab.org/notes/warren/11-22-2017/use-git-and-github-to-contribute-and-improve-public-lab-software) is a link to our Git workflow.

## Let the code be with you. 
### Happy opensourcing. :smile:
