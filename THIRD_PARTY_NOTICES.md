# Third-party notices

## AgX highlight transform adapted from Noniv/web-ocean

Source: https://github.com/Noniv/web-ocean/blob/a07c7fd522ef0a897601c114f927a49d93d95520/js/wgsl/post.js (AgX inset/outset matrices and sixth-degree contrast fit, approximately lines78–98). These numerical blocks are adapted in `src/corridor-post-shaders.js` function `agxDisplay` for the corridor display path. The complete notice also appears in that source and the built standalone HTML. The ECHO-9 material, geometry, lighting and atmosphere implementation remains project code; this notice does not relicense the entire project.

The ocean/sky source also informed footprint filtering and slope-variance AA principles, implemented specifically for industrial surfaces. No water simulation, cloud system, LUT, texture or model is imported. Runtime remains native WebGPU/WGSL in one offline HTML. Actual A/B evaluation is recorded under `docs/qa/overhaul-v1/iteration-3/`.

MIT License

Copyright (c) 2026 Maksymilian Dendura

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
