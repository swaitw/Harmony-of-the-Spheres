export default {
    name: 'The Figure Eight',
    type: 'Choreography',
    g: 100,
    dt: 0.01,
    elapsedTime: 0,
    rotatingReferenceFrame: 'Origo',
    cameraPosition: 'Free',
    cameraFocus: 'Origo',
    freeOrigo: { x: 0, y: 0, z: 800000000 },
    massBeingModified: 'Eva',
    distMax: 400,
    distMin: -400,
    primary: 'Arjuna',
    maximumDistance: { name: 'Sun to Neptune', value: 30.1 },
    distanceStep: { name: 'Sun to Earth / 10', value: 0.1 },
    scenarioWikiUrl: 'https://en.wikipedia.org/wiki/Three-body_problem',
    masses: [
        {
            name: 'Eva',
            type: 'star',
            light: false,
            trailVertices: 220,
            radius: 6000000,
            m: 1e4,
            x: -100,
            y: 0,
            z: 0,
            vx: 34.7111,
            vy: 53.2728,
            vz: 0
        },
        {
            name: 'Sarada',
            type: 'star',
            light: false,
            trailVertices: 220,
            radius: 6000000,
            m: 1e4,
            x: 100,
            y: 0,
            z: 0,
            vx: 34.7111,
            vy: 53.2728,
            vz: 0
        },
        {
            name: 'Arjuna',
            type: 'star',
            light: false,
            trailVertices: 220,
            radius: 6000000,
            m: 1e4,
            x: 0,
            y: 0,
            z: 0,
            vx: -69.4222,
            vy: -106.5456,
            vz: 0
        }
    ]
};
//# sourceMappingURL=threeBodyCoreography.js.map