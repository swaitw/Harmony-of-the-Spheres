export default {
    name: 'Three Body Shenanigans',
    type: 'Choreography',
    g: 100,
    dt: 0.05,
    elapsedTime: 0,
    rotatingReferenceFrame: 'Origo',
    cameraPosition: 'Free',
    cameraFocus: 'Origo',
    freeOrigo: { x: 0, y: 0, z: 800000000 },
    massBeingModified: 'Adelie',
    distMax: 400,
    distMin: -400,
    primary: 'Adelie',
    maximumDistance: { name: 'Sun to Neptune', value: 30.1 },
    distanceStep: { name: 'Sun to Earth / 10', value: 0.1 },
    scenarioWikiUrl: 'https://en.wikipedia.org/wiki/Three-body_problem',
    masses: [
        {
            name: 'Adelie',
            type: 'star',
            light: !1,
            trailVertices: 200,
            radius: 6e6,
            m: 1e4,
            x: -97.966564648019,
            y: 0,
            z: 0,
            vx: 1.190653832229,
            vy: -99.052143194193,
            vz: 0
        },
        {
            name: 'Kian',
            type: 'star',
            light: !1,
            trailVertices: 200,
            radius: 6e6,
            m: 1e4,
            x: 87.161551684016,
            y: 0,
            z: 0,
            vx: -2.101670735083,
            vy: -34.234000081548,
            vz: 0
        },
        {
            name: 'Kelwin',
            type: 'star',
            light: !1,
            trailVertices: 200,
            radius: 6e6,
            m: 1e4,
            x: 10.805012998999,
            y: 0,
            z: 0,
            vx: 0.91101690249,
            vy: 133.286143310735,
            vz: 0
        }
    ]
};
//# sourceMappingURL=shenanigans.js.map