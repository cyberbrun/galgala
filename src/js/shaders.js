THREE.BlenderShader = {

	uniforms: {
	
		"tMain": { type: "t", value: null },
		"tBloom": { type: "t", value: null },
		"tHUD": { type: "t", value: null }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tMain;",
		"uniform sampler2D tBloom;",
		"uniform sampler2D tHUD;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec4 mainTexel = texture2D( tMain, vUv );",
			"vec4 bloomTexel = texture2D( tBloom, vUv );",
			"vec4 HUDTexel = texture2D( tHUD, vUv );",
           
			//"gl_FragColor = mainTexel + bloomTexel;// mix(texel1, texel2, texel2.r + texel2.g + texel2.b);",
			"gl_FragColor = mix(mainTexel + bloomTexel, HUDTexel, HUDTexel.a);// + HUDTexel.g + HUDTexel.b);",
		"}"

	].join("\n")

};
