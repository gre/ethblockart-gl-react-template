import React, { useEffect } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import MersenneTwister from "mersenne-twister";

/*
Create your Custom style to be turned into a EthBlock.art Mother NFT

Basic rules:
 - use a minimum of 1 and a maximum of 4 "modifiers", modifiers are values between 0 and 1,
 - use a minimum of 1 and a maximum of 3 colors, the color "background" will be set at the canvas root
 - Use the block as source of entropy, no Math.random() allowed!
 - You can use a "shuffle bag" using data from the block as seed, a MersenneTwister library is provided

 Arguments:
  - block: the blockData, in this example template you are given 3 different blocks to experiment with variations, check App.js to learn more
  - mod[1-3]: template modifier arguments with arbitrary defaults to get your started
  - color: template color argument with arbitrary default to get you started

Getting started:
 - Write gl-react code, comsuming the block data and modifier arguments,
   make it cool and use no random() internally, component must be pure, output deterministic
 - Customize the list of arguments as you wish, given the rules listed below
 - Provide a set of initial /default values for the implemented arguments, your preset.
 - Think about easter eggs / rare attributes, display something different every 100 blocks? display something unique with 1% chance?

 - check out https://gl-react-cookbook.surge.sh/ for examples!
*/

export const styleMetadata = {
  name: "",
  description: "",
  image: "",
  creator_name: "",
  options: {
    mod1: 0.5,
    mod2: 0.5,
  },
};

const shaders = Shaders.create({
  main: {
    frag: GLSL`
precision highp float;
varying vec2 uv;

uniform float mod1;
uniform float mod2;
uniform float seed;

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
  return a + b*cos( 6.28318*(c*t+d) );
}
float cell (vec2 p) {
  float m = 2. + floor(32.0 * mod1 * (0.2 + seed));
  return mod(mod(p.x * (p.x + 32. * p.y), m * floor(1.0 + 64.0 * seed) + 1.), m);
}
void main() {
  float unzoom = 64.;
  vec2 offset = vec2(-.25 * unzoom, -2.);
  vec3 c = palette(mod2 + .1 * cell(floor(uv * unzoom + offset)), vec3(.5), vec3(.5), vec3(1.), vec3(1.0, .3, .5));
  gl_FragColor = vec4(c, 1.0);
}
  `,
  },
});

const CustomStyle = ({ block, attributesRef, width, height, mod1, mod2 }) => {
  useAttributes(attributesRef);

  const { hash } = block;

  const rng = new MersenneTwister(parseInt(hash.slice(0, 16), 16));

  return (
    <Node
      shader={shaders.main}
      uniforms={{
        mod1,
        mod2,
        seed: rng.random(),
      }}
    />
  );
};

function useAttributes(ref) {
  // Update custom attributes related to style when the modifiers change
  useEffect(() => {
    ref.current = () => {
      return {
        // This is called when the final image is generated, when creator opens the Mint NFT modal.
        // should return an object structured following opensea/enjin metadata spec for attributes/properties
        // https://docs.opensea.io/docs/metadata-standards
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema

        attributes: [
          {
            trait_type: "your trait here text",
            value: "replace me",
          },
        ],
      };
    };
  }, [ref]);
}

export default CustomStyle;
